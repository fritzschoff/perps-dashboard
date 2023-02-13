import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
  PositionLiquidated as PositionLiquidatedEvent,
  PositionModified as PositionModifiedEvent,
} from '../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable';
import {
  PositionLiquidated,
  Trader,
  Synthetix,
  FuturesPosition,
  FuturesTrade,
} from '../generated/schema';
import { PerpMarkets, PerpProxies } from '../utils/constants';

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
  let perpMarketInformation: PerpMarkets;

  for (let index = 0; index < PerpProxies.length; index++) {
    if (
      PerpProxies.at(index)
        .getAddress()
        .toLowerCase() === event.address.toHex().toLowerCase()
    ) {
      perpMarketInformation = PerpProxies.at(index);
    }
  }

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
    futuresPosition = new FuturesPosition(
      event.address.toHex() + '-' + event.params.id.toHex()
    );
    if (!!perpMarketInformation) {
      futuresPosition.asset = perpMarketInformation.getAsset();
      futuresPosition.market = perpMarketInformation.getMarket();
    } else {
      futuresPosition.asset = 'not found';
      futuresPosition.market = 'not found';
    }
    futuresPosition.openTimestamp = event.block.timestamp;
    futuresPosition.account = event.params.account;
    futuresPosition.isOpen = true;
    futuresPosition.isLiquidated = false;
    futuresPosition.size = event.params.size;
    futuresPosition.initialMargin = event.params.margin.plus(event.params.fee);
    futuresPosition.margin = event.params.margin;
    futuresPosition.pnl = event.params.fee.times(BigInt.fromI32(-1));
    futuresPosition.entryPrice = event.params.lastPrice;
    futuresPosition.lastPrice = event.params.lastPrice;
    futuresPosition.trades = BigInt.fromI32(1);
    futuresPosition.long = event.params.tradeSize.gt(BigInt.fromI32(0));
    futuresPosition.totalVolume = event.params.tradeSize
      .times(event.params.lastPrice)
      .div(BigInt.fromI32(10).pow(18))
      .abs();

    const tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );
    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.asset = perpMarketInformation.getAsset();
    tradeEntity.market = perpMarketInformation.getMarket();
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.pnl = event.params.fee.times(BigInt.fromI32(-1));
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = false;
    tradeEntity.save();
    if (!trader) {
      trader = new Trader(event.params.account.toHex());
      trader.totalLiquidations = BigInt.fromI32(0);
      trader.totalMarginLiquidated = BigDecimal.fromString('0');
      trader.feesPaidToSynthetix = event.params.fee.toBigDecimal();
      trader.pnl = event.params.fee.times(BigInt.fromI32(-1));
      trader.trades = [];
    } else {
      trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
        event.params.fee.toBigDecimal()
      );
    }
    trader.trades!.push(tradeEntity.id);
  }

  // Position closed & != liquidated
  if (event.params.size.isZero() == true && !event.params.tradeSize.isZero()) {
    futuresPosition.isOpen = false;
    futuresPosition.exitPrice = event.params.lastPrice;
    futuresPosition.closeTimestamp = event.block.timestamp;

    const tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );

    const newPnl = event.params.lastPrice
      .minus(futuresPosition.lastPrice)
      .times(futuresPosition.size)
      .div(BigInt.fromI32(10).pow(18));

    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.asset = perpMarketInformation.getAsset();
    tradeEntity.market = perpMarketInformation.getMarket();
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.pnl = newPnl;
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = true;
    tradeEntity.save();
    if (trader) {
      // no need to add the fees to the trader entity because we are
      // doing that in the liquidation event
      trader.pnl = trader.pnl.plus(newPnl);
      trader.trades!.push(tradeEntity.id);
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
    const newPnl = event.params.lastPrice
      .minus(futuresPosition.lastPrice)
      .times(futuresPosition.size)
      .div(BigInt.fromI32(10).pow(18));

    let tradeEntity = new FuturesTrade(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    );

    tradeEntity.timestamp = event.block.timestamp;
    tradeEntity.account = event.params.account;
    tradeEntity.margin = event.params.margin.plus(event.params.fee);
    tradeEntity.size = event.params.tradeSize;
    tradeEntity.asset = perpMarketInformation.getAsset();
    tradeEntity.market = perpMarketInformation.getMarket();
    tradeEntity.price = event.params.lastPrice;
    tradeEntity.positionSize = event.params.size;
    tradeEntity.feesPaidToSynthetix = event.params.fee;
    tradeEntity.positionClosed = false;
    tradeEntity.pnl = newPnl;

    tradeEntity.save();

    if (trader) {
      trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
        event.params.fee.toBigDecimal()
      );
      trader.pnl = trader.pnl.plus(newPnl);
      trader.trades!.push(tradeEntity.id);
      trader.save();
    }

    let volume = tradeEntity.size
      .times(tradeEntity.price)
      .div(BigInt.fromI32(10).pow(18))
      .abs();

    futuresPosition.totalVolume = futuresPosition.totalVolume.plus(volume);
  }

  synthetix.save();
  futuresPosition.save();
}
