import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts';
import { PositionModified } from '../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable';
function createBlock(timestamp: i64, blockNumber: i64): Map<string, i64> {
  const newBlock = new Map<string, i64>();
  newBlock.set('timestamp', timestamp);
  newBlock.set('blockNumber', blockNumber);
  return newBlock;
}

export function createPositionModifiedEvent(
  id: BigInt,
  account: Address,
  margin: BigInt,
  size: BigInt,
  tradeSize: BigInt,
  lastPrice: BigInt,
  fundingIndex: BigInt,
  fee: BigInt,
  timestamp: i64,
  logIndex: i64 = 0
): PositionModified {
  let positionModifiedEvent = changetype<PositionModified>(newMockEvent());
  positionModifiedEvent.parameters = new Array();
  const block = createBlock(timestamp, 5);
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam('margin', ethereum.Value.fromUnsignedBigInt(margin))
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam('size', ethereum.Value.fromSignedBigInt(size))
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam(
      'tradeSize',
      ethereum.Value.fromSignedBigInt(tradeSize)
    )
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam(
      'lastPrice',
      ethereum.Value.fromUnsignedBigInt(lastPrice)
    )
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam(
      'fundingIndex',
      ethereum.Value.fromUnsignedBigInt(fundingIndex)
    )
  );
  positionModifiedEvent.parameters.push(
    new ethereum.EventParam('fee', ethereum.Value.fromUnsignedBigInt(fee))
  );

  positionModifiedEvent.block.timestamp = BigInt.fromI64(block['timestamp']);
  if (logIndex) positionModifiedEvent.logIndex = BigInt.fromI64(logIndex);
  return positionModifiedEvent;
}
