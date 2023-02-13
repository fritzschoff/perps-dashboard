import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
  PositionLiquidated as PositionLiquidatedEvent,
  PositionModified as PositionModifiedEvent,
  DelayedOrderRemoved as DelayedOrderRemovedEvent,
  DelayedOrderSubmitted as DelayedOrderSubmittedEvent,
} from '../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable';
import {
  PositionLiquidated,
  Trader,
  Synthetix,
  FuturesPosition,
  FuturesOrder,
  FuturesTrade,
} from '../generated/schema';

export function handlePositionLiquidated(event: PositionLiquidatedEvent): void {
  const positionLiquidatedEntity = new PositionLiquidated(
    event.params.id.toString()
  );
  positionLiquidatedEntity.account = event.params.account;
  positionLiquidatedEntity.liquidator = event.params.liquidator;
  positionLiquidatedEntity.size = event.params.size.toBigDecimal();
  positionLiquidatedEntity.price = event.params.price.toBigDecimal();
  positionLiquidatedEntity.fee = event.params.fee.toBigDecimal();
  positionLiquidatedEntity.timestamp = event.block.timestamp;
  positionLiquidatedEntity.block = event.block.number;
  positionLiquidatedEntity.save();

  let synthetix = Synthetix.load('synthetix');
  if (synthetix) {
    synthetix.feesByLiquidations = synthetix.feesByLiquidations.plus(
      event.params.fee.toBigDecimal()
    );

    let futuresPosition = FuturesPosition.load(
      event.address.toHex() + '-' + event.params.id.toHex()
    );

    if (futuresPosition) {
      futuresPosition.isLiquidated = true;
      futuresPosition.isOpen = false;
      futuresPosition.size = BigInt.fromI32(0);
      synthetix.totalVolume = synthetix.totalVolume.plus(
        futuresPosition.totalVolume.toBigDecimal()
      );
      futuresPosition.save();
    }
    let trader = Trader.load(event.params.account.toHex());
    if (trader) {
      trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
        event.params.fee.toBigDecimal()
      );
      trader.totalLiquidations = trader.totalLiquidations.plus(
        BigInt.fromI32(1)
      );
      trader.totalMarginLiquidated = trader.totalMarginLiquidated.plus(
        event.params.size.toBigDecimal()
      );
      trader.save();
    }
    synthetix.save();
  }
}

export function handlePositionModified(event: PositionModifiedEvent): void {
  // Load all information
  let futuresPosition = FuturesPosition.load(
    event.address.toHex() + '-' + event.params.id.toHex()
  );
  let trader = Trader.load(event.params.account.toHex());
  let synthetix = Synthetix.load('synthetix');
  const positionId = event.address.toHex() + '-' + event.params.id.toHex();

  if (!synthetix) {
    synthetix = new Synthetix('synthetix');
    synthetix.feesByPositionModifications = event.params.fee.toBigDecimal();
    synthetix.feesByLiquidations = BigDecimal.fromString('0');
    synthetix.totalVolume = BigDecimal.fromString('0');
    // If liquidated, we add the fees in the liquidation handler
  } else if (!event.params.size.isZero() && !event.params.tradeSize.isZero()) {
    synthetix.feesByPositionModifications = synthetix.feesByPositionModifications.plus(
      event.params.fee.toBigDecimal()
    );
  }

  // New position
  if (!futuresPosition) {
    futuresPosition = new FuturesPosition(positionId);
    futuresPosition.openTimestamp = event.block.timestamp;
    futuresPosition.account = event.params.account;
    futuresPosition.isOpen = true;
    futuresPosition.isLiquidated = false;
    futuresPosition.size = event.params.size;
    futuresPosition.feesPaidToSynthetix = event.params.fee;
    futuresPosition.initialMargin = event.params.margin.plus(event.params.fee);
    futuresPosition.margin = event.params.margin;
    futuresPosition.pnl = event.params.fee.times(BigInt.fromI32(-1));
    futuresPosition.entryPrice = event.params.lastPrice;
    futuresPosition.lastPrice = event.params.lastPrice;
    futuresPosition.trades = BigInt.fromI32(1);
    futuresPosition.long = event.params.tradeSize.gt(BigInt.fromI32(0));
    futuresPosition.market = event.address;
    futuresPosition.totalVolume = event.params.tradeSize
      .times(event.params.lastPrice)
      .div(BigInt.fromI32(10).pow(18))
      .abs();

    const tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );
    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.positionId = positionId;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.market = event.address;
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.pnl = event.params.fee.times(BigInt.fromI32(-1));
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = false;
    tradeEntity.type = 'PositionOpened';
    tradeEntity.save();
    if (!trader) {
      trader = new Trader(event.params.account.toHex());
      trader.totalLiquidations = BigInt.fromI32(0);
      trader.totalMarginLiquidated = BigDecimal.fromString('0');
      trader.feesPaidToSynthetix = event.params.fee.toBigDecimal();
      trader.totalVolume = event.params.tradeSize.toBigDecimal();
      trader.pnl = event.params.fee.times(BigInt.fromI32(-1));
      trader.trades = [];
    } else {
      trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
        event.params.fee.toBigDecimal()
      );
      trader.totalVolume = event.params.tradeSize.toBigDecimal();
      trader.pnl = trader.pnl.plus(event.params.fee.times(BigInt.fromI32(-1)));
    }
    const oldTrades = trader.trades;
    oldTrades!.push(tradeEntity.id);
    trader.trades = oldTrades;
    trader.save();
  }

  // Position closed & != liquidated
  if (event.params.size.isZero() == true && !event.params.tradeSize.isZero()) {
    futuresPosition.isOpen = false;
    futuresPosition.exitPrice = event.params.lastPrice;
    futuresPosition.closeTimestamp = event.block.timestamp;
    futuresPosition.feesPaidToSynthetix = futuresPosition.feesPaidToSynthetix.plus(
      event.params.fee
    );

    const tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );

    const newPnl = event.params.lastPrice
      .minus(futuresPosition.lastPrice)
      .times(futuresPosition.size)
      .div(BigInt.fromI32(10).pow(18));

    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.positionId = positionId;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.market = event.address;
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.pnl = newPnl;
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = true;
    tradeEntity.type = 'PositionClosed';
    tradeEntity.save();
    if (trader) {
      // no need to add the fees to the trader entity because we are
      // doing that in the liquidation event
      trader.pnl = trader.pnl.plus(newPnl);
      const oldTrades = trader.trades;
      oldTrades!.push(tradeEntity.id);
      trader.trades = oldTrades;
      trader.save();
    }

    // no need to add the fees to the synthetix entity because we are
    // doing that in the liquidation event
    synthetix.totalVolume = synthetix.totalVolume.plus(
      futuresPosition.totalVolume.toBigDecimal()
    );
  }

  // If position is already opened, so it got modified
  if (
    !event.params.tradeSize.isZero() &&
    !event.params.size.isZero() &&
    futuresPosition
  ) {
    futuresPosition.long = event.params.size
      .plus(event.params.tradeSize)
      .gt(BigInt.fromI32(0));
    futuresPosition.feesPaidToSynthetix = futuresPosition.feesPaidToSynthetix.plus(
      event.params.fee
    );
    const newPnl = event.params.lastPrice
      .minus(futuresPosition.lastPrice)
      .times(futuresPosition.size)
      .div(BigInt.fromI32(10).pow(18));

    let tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );

    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.positionId = positionId;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.market = event.address;
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = false;
    tradeEntity.pnl = newPnl;
    tradeEntity.type = 'PositionModified';
    tradeEntity.save();

    let volume = tradeEntity.size
      .times(tradeEntity.price)
      .div(BigInt.fromI32(10).pow(18))
      .abs();

    if (trader) {
      trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
        event.params.fee.toBigDecimal()
      );
      trader.totalVolume = trader.totalVolume.plus(volume.toBigDecimal());
      trader.pnl = trader.pnl.plus(newPnl);
      const oldTrades = trader.trades;
      oldTrades!.push(tradeEntity.id);
      trader.trades = oldTrades;
      trader.save();
    }

    futuresPosition.totalVolume = futuresPosition.totalVolume.plus(volume);
  }

  synthetix.save();
  futuresPosition.save();
}

export function handleDelayedOrderRemoved(
  event: DelayedOrderRemovedEvent
): void {
  const futuresOrderEntityId = `${event.params.account.toHexString()}-${event.params.targetRoundId.toString()}`;
  let futuresOrderEntity = FuturesOrder.load(futuresOrderEntityId);
  let statEntity = Trader.load(event.params.account.toHex());
  let synthetix = Synthetix.load('synthetix');
  if (synthetix) {
    synthetix.feesByLiquidations = synthetix.feesByLiquidations.plus(
      event.params.keeperDeposit.toBigDecimal()
    );
    if (futuresOrderEntity) {
      futuresOrderEntity.keeper = event.transaction.from;
      let tradeEntity = FuturesTrade.load(
        event.transaction.hash.toHex() +
          '-' +
          event.logIndex.minus(BigInt.fromI32(1)).toString()
      );

      if (statEntity && tradeEntity) {
        // if trade exists get the position
        let positionEntity = FuturesPosition.load(tradeEntity.positionId);

        // update order values
        futuresOrderEntity.status = 'Filled';
        tradeEntity.type = futuresOrderEntity.orderType;

        // add fee if not self-executed
        if (futuresOrderEntity.keeper != futuresOrderEntity.account) {
          tradeEntity.feesPaidToSynthetix = tradeEntity.feesPaidToSynthetix.plus(
            event.params.keeperDeposit
          );
          statEntity.feesPaidToSynthetix = statEntity.feesPaidToSynthetix.plus(
            event.params.keeperDeposit.toBigDecimal()
          );
          if (positionEntity) {
            positionEntity.feesPaidToSynthetix = positionEntity.feesPaidToSynthetix.plus(
              event.params.keeperDeposit
            );
            positionEntity.save();
          }

          statEntity.save();
        }

        tradeEntity.save();
      } else if (statEntity) {
        if (futuresOrderEntity.keeper != futuresOrderEntity.account) {
          statEntity.feesPaidToSynthetix = statEntity.feesPaidToSynthetix.plus(
            event.params.keeperDeposit.toBigDecimal()
          );
          statEntity.save();
        }

        futuresOrderEntity.status = 'Cancelled';
      }

      futuresOrderEntity.save();
    }
  }
}

export function handleDelayedOrderSubmitted(
  event: DelayedOrderSubmittedEvent
): void {
  const futuresOrderEntityId = `$${event.params.account.toHexString()}-${event.params.targetRoundId.toString()}`;
  let futuresOrderEntity = FuturesOrder.load(futuresOrderEntityId);
  if (futuresOrderEntity == null) {
    futuresOrderEntity = new FuturesOrder(futuresOrderEntityId);
  }
  futuresOrderEntity.size = event.params.sizeDelta;
  futuresOrderEntity.market = event.address;
  futuresOrderEntity.account = event.params.account;
  futuresOrderEntity.orderId = event.params.targetRoundId;
  futuresOrderEntity.targetRoundId = event.params.targetRoundId;
  futuresOrderEntity.targetPrice = BigInt.fromI32(0);
  futuresOrderEntity.marginDelta = BigInt.fromI32(0);
  futuresOrderEntity.timestamp = event.block.timestamp;
  futuresOrderEntity.orderType = event.params.isOffchain
    ? 'DelayedOffchainSubmitted'
    : 'DelayedOrderSubmitted';
  futuresOrderEntity.status = 'Pending';
  futuresOrderEntity.keeper = Address.fromHexString(
    '0x0000000000000000000000000000000000000000'
  );
  futuresOrderEntity.save();
}
