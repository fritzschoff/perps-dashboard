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

  let trader = Trader.load(event.params.account.toHex());
  if (trader) {
    trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
      event.params.fee.toBigDecimal()
    );
    trader.totalLiquidations = trader.totalLiquidations.plus(BigInt.fromI32(1));
    trader.totalMarginLiquidated = trader.totalMarginLiquidated.plus(
      event.params.size.toBigDecimal()
    );
    trader.save();
  }
  let synthetix = Synthetix.load('synthetix');
  if (!synthetix) {
    synthetix = new Synthetix('synthetix');
    synthetix.feesByLiquidations = event.params.fee.toBigDecimal();
    synthetix.feesByPositionModifications = BigDecimal.fromString('0');
  } else {
    synthetix.feesByLiquidations = synthetix.feesByLiquidations.plus(
      event.params.fee.toBigDecimal()
    );
  }
  synthetix.save();
}

export function handlePositionModified(event: PositionModifiedEvent): void {
  let futuresPosition = FuturesPosition.load(
    event.address.toHex() + '-' + event.params.id.toHex()
  );
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
    futuresPosition.block = event.block.number;
    futuresPosition.openTimestamp = event.block.timestamp;
    futuresPosition.isOpen = true;
    futuresPosition.isLiquidated = false;
    futuresPosition.size = event.params.size;
    futuresPosition.initialMargin = event.params.margin.plus(event.params.fee);
    futuresPosition.margin = event.params.margin;
    futuresPosition.pnl = BigInt.fromI32(0);
    futuresPosition.totalDeposits = BigInt.fromI32(0);
    futuresPosition.entryPrice = event.params.lastPrice;
    futuresPosition.lastPrice = event.params.lastPrice;
  }

  futuresPosition.trades = futuresPosition.trades.plus(BigInt.fromI32(1));

  // calculate pnl
  const newPnl = event.params.lastPrice
    .minus(futuresPosition.lastPrice)
    .times(futuresPosition.size)
    .div(BigInt.fromI32(10).pow(18));
  futuresPosition.pnl = futuresPosition.pnl.plus(newPnl);
  if (event.params.size.isZero() == true) {
    futuresPosition.isOpen = false;
    futuresPosition.exitPrice = event.params.lastPrice;
    futuresPosition.closeTimestamp = event.block.timestamp;
  } else {
    // if the position is not closed...
    // if position changes sides, reset the entry price
    if (
      (futuresPosition.size.lt(BigInt.fromI32(0)) &&
        event.params.size.gt(BigInt.fromI32(0))) ||
      (futuresPosition.size.gt(BigInt.fromI32(0)) &&
        event.params.size.lt(BigInt.fromI32(0)))
    ) {
      futuresPosition.entryPrice = event.params.lastPrice; // Deprecate this after migrating frontend
    } else {
      // check if the position side increases (long or short)
      if (event.params.size.abs().gt(futuresPosition.size.abs())) {
        // if so, calculate the new average price
        const existingSize = futuresPosition.size.abs();
        const existingPrice = existingSize.times(futuresPosition.entryPrice);

        const newPrice = event.params.tradeSize
          .abs()
          .times(event.params.lastPrice);
        futuresPosition.entryPrice = existingPrice
          .plus(newPrice)
          .div(event.params.size.abs()); // Deprecate this after migrating frontend
      }
      // otherwise do nothing
    }
  }
  futuresPosition.size = event.params.size;
  futuresPosition.margin = event.params.margin;
  futuresPosition.lastPrice = event.params.lastPrice;
  let trader = Trader.load(event.params.account.toHex());
  if (!trader) {
    trader = new Trader(event.params.account.toHex());
    trader.totalLiquidations = BigInt.fromI32(0);
    trader.totalMarginLiquidated = BigDecimal.fromString('0');
    trader.tradeCount = BigInt.fromI32(1);
    trader.feesPaidToSynthetix = event.params.fee.toBigDecimal();
  } else {
    trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
      event.params.fee.toBigDecimal()
    );
  }
  let synthetix = Synthetix.load('synthetix');
  if (!synthetix) {
    synthetix = new Synthetix('synthetix');
    synthetix.feesByPositionModifications = event.params.fee.toBigDecimal();
    synthetix.feesByLiquidations = BigDecimal.fromString('0');
  } else {
    synthetix.feesByPositionModifications = synthetix.feesByPositionModifications.plus(
      event.params.fee.toBigDecimal()
    );
  }
  trader.save();
  synthetix.save();
  futuresPosition.save();
}
