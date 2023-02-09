import { BigInt, Address, BigDecimal } from '@graphprotocol/graph-ts';
import {
  PositionLiquidated as PositionLiquidatedEvent,
  PositionModified as PositionModifiedEvent,
} from '../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable';
import { MarketAdded as MarketAddedEvent } from '../generated/FuturesMarketManager/FuturesMarketManager';
import {
  PositionLiquidated,
  Trader,
  Synthetix,
  FuturesPosition,
  FuturesMarket,
} from '../generated/schema';

export function handleV2MarketAdded(event: MarketAddedEvent): void {
  let marketEntity = new FuturesMarket(event.params.market.toHex());
  marketEntity.asset = event.params.asset;
  marketEntity.marketKey = event.params.marketKey;
  marketEntity.save();
}

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
  if (!trader) {
    trader = new Trader(event.params.account.toHex());
  }
  trader.feesPaidToSynthetix = trader.feesPaidToSynthetix.plus(
    event.params.fee.toBigDecimal()
  );
  trader.totalLiquidations = trader.totalLiquidations.plus(BigInt.fromI32(1));
  trader.totalMarginLiquidated = trader.totalMarginLiquidated.plus(
    event.params.size.toBigDecimal()
  );
  trader!.save();
  let synthetix = Synthetix.load('synthetix');
  if (!synthetix) {
    synthetix = new Synthetix('synthetix');
  }
  synthetix.feesGeneratedByLiquidations = synthetix.feesGeneratedByLiquidations.plus(
    event.params.fee.toBigDecimal()
  );
  synthetix.feesGeneratedByLiquidations = event.params.fee.toBigDecimal();
  synthetix.save();
}

export function handlePositionModified(event: PositionModifiedEvent): void {
  let futuresMarketAddress = event.address as Address;
  let positionId = futuresMarketAddress.toHex() + '-' + event.params.id.toHex();
  let positionEntity = FuturesPosition.load(positionId);
  let marketEntity = FuturesMarket.load(futuresMarketAddress.toHex());
  let trader = Trader.load(event.params.account.toHex());
  if (!trader) {
    trader = new Trader(event.params.account.toHex());
    trader.totalLiquidations = BigInt.fromI32(0);
    trader.totalMarginLiquidated = BigDecimal.fromString('0');
    trader.feesPaidToSynthetix = BigDecimal.fromString('0');
    trader.tradeCount = BigInt.fromI32(0);
  }
  trader.tradeCount = trader.tradeCount.plus(BigInt.fromI32(1));

  // if it's a new position...
  if (!positionEntity) {
    positionEntity = new FuturesPosition(positionId);
    positionEntity.pnl = BigInt.fromI32(0);
  } else {
    positionEntity.pnl = event.params.lastPrice
      .minus(positionEntity.lastPrice)
      .times(positionEntity.size)
      .div(BigInt.fromI32(10).pow(18));
  }
  positionEntity.market = futuresMarketAddress;
  if (marketEntity) {
    positionEntity.asset = marketEntity.asset;
    positionEntity.marketKey = marketEntity.marketKey;
  }
  positionEntity.isLiquidated = false;
  positionEntity.isOpen = true;
  positionEntity.size = event.params.size;
  positionEntity.timestamp = event.block.timestamp;
  positionEntity.openTimestamp = event.block.timestamp;
  positionEntity.avgEntryPrice = event.params.lastPrice;
  positionEntity.entryPrice = event.params.lastPrice;
  positionEntity.lastPrice = event.params.lastPrice;
  positionEntity.margin = event.params.margin;
  positionEntity.initialMargin = event.params.margin.plus(event.params.fee);
  positionEntity.feesPaid = BigInt.fromI32(0);
  positionEntity.pnlWithFeesPaid = BigInt.fromI32(0);
  positionEntity.netTransfers = BigInt.fromI32(0);
  positionEntity.totalDeposits = BigInt.fromI32(0);
  positionEntity.totalVolume = BigInt.fromI32(0);
  positionEntity.totalDeposits = positionEntity.totalDeposits.plus(
    marginTransferEntity.size
  );
  positionEntity.lastTxHash = event.transaction.hash;
  positionEntity.timestamp = event.block.timestamp;
  positionEntity.size = event.params.size;
  positionEntity.margin = event.params.margin;
  positionEntity.lastPrice = event.params.lastPrice;
  positionEntity.feesPaid = positionEntity.feesPaid.plus(totalFeesPaid);
  positionEntity.pnlWithFeesPaid = positionEntity.pnl
    .minus(positionEntity.feesPaid)
    .plus(positionEntity.netFunding);
  const newSize = event.params.tradeSize.abs();
  const newPrice = newSize.times(event.params.lastPrice);
  positionEntity.entryPrice = existingPrice
    .plus(newPrice)
    .div(event.params.size.abs());
  positionEntity.avgEntryPrice = existingPrice
    .plus(newPrice)
    .div(event.params.size.abs());
  if (event.params.size.isZero() == true) {
    positionEntity.isOpen = false;
    positionEntity.exitPrice = event.params.lastPrice;
    positionEntity.closeTimestamp = event.block.timestamp;
  }
  positionEntity.save();
}
