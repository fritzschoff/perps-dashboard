import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  assert,
  describe,
  test,
  clearStore,
  logStore,
  afterEach,
} from 'matchstick-as/assembly/index';
import { createPositionModifiedEvent } from './perpsV2-utils';
import { handlePositionModified } from '../src/futures';

const trader = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
function toEth(n: i32): BigInt {
  return BigInt.fromI32(n).times(BigInt.fromI32(10).pow(18));
}

/**
 * - check pnl calc
 *
 */

describe('Perps V2', () => {
  afterEach(() => {
    clearStore();
  });

  test('should only create one entity when a position is getting opened', () => {
    const event = createPositionModifiedEvent(
      BigInt.fromI32(1),
      Address.fromString(trader),
      toEth(200),
      BigInt.fromI32(0),
      toEth(100),
      toEth(1000),
      BigInt.fromI32(1),
      toEth(2),
      10
    );
    handlePositionModified(event);

    // FUTURES POSITION
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'id',
      `${event.address.toHex() + '-' + '0x1'}`
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'account',
      trader.toLowerCase()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'margin',
      toEth(200).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'size',
      '0'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'lastPrice',
      toEth(1000).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'feesPaidToSynthetix',
      toEth(2).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'trades',
      '1'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'long',
      'true'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'isOpen',
      'true'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'isLiquidated',
      'false'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'initialMargin',
      toEth(202).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'pnl',
      `-${toEth(2).toString()}`
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'totalVolume',
      toEth(100)
        .times(toEth(1000))
        .div(BigInt.fromI32(10).pow(18))
        .toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'openTimestamp',
      '10'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${event.address.toHex() + '-' + '0x1'}`,
      'openTimestamp',
      '10'
    );
    assert.entityCount('FuturesPosition', 1);

    // FUTURES TRADE
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'timestamp',
      '10'
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'account',
      trader.toLowerCase()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'margin',
      toEth(202).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'positionId',
      `${event.address.toHex() + '-' + '0x1'}`
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'size',
      toEth(100).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'market',
      event.address.toHex()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'price',
      toEth(1000).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'positionSize',
      toEth(0).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'positionClosed',
      'false'
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'pnl',
      `-${toEth(2).toString()}`
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'feesPaidToSynthetix',
      toEth(2).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${event.transaction.hash.toHex() + '-' + event.logIndex.toString()}`,
      'type',
      'PositionOpened'
    );
    assert.entityCount('FuturesTrade', 1);

    // SYNTHETIX
    assert.fieldEquals(
      'Synthetix',
      'synthetix',
      'feesByPositionModifications',
      toEth(2).toString()
    );
    assert.fieldEquals(
      'Synthetix',
      'synthetix',
      'totalVolume',
      toEth(100)
        .times(toEth(1000).div(BigInt.fromI32(10).pow(18)))
        .toString()
    );
    assert.entityCount('Synthetix', 1);
  });

  test('should update the existing FuturesPosition entity', () => {
    const createPositionEvent = createPositionModifiedEvent(
      BigInt.fromI32(1),
      Address.fromString(trader),
      toEth(200),
      BigInt.fromI32(0),
      toEth(100),
      toEth(1000),
      BigInt.fromI32(1),
      toEth(2),
      10,
      1
    );
    handlePositionModified(createPositionEvent);
    const modifyPositionEvent = createPositionModifiedEvent(
      BigInt.fromI32(1),
      Address.fromString(trader),
      toEth(300),
      BigInt.fromI32(400),
      toEth(300),
      toEth(1200),
      BigInt.fromI32(2),
      toEth(2),
      20,
      2
    );
    handlePositionModified(modifyPositionEvent);

    // SYNTHETIX
    assert.fieldEquals(
      'Synthetix',
      'synthetix',
      'totalVolume',
      toEth(100)
        .times(toEth(1000).div(BigInt.fromI32(10).pow(18)))
        .plus(toEth(300).times(toEth(1200).div(BigInt.fromI32(10).pow(18))))
        .toString()
    );
    assert.fieldEquals(
      'Synthetix',
      'synthetix',
      'feesByPositionModifications',
      toEth(4).toString()
    );
    assert.entityCount('Synthetix', 1);

    // FUTURES POSITION
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'trades',
      '2'
    );

    // FUTURES TRADE
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'timestamp',
      '20'
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'account',
      trader.toLowerCase()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'margin',
      toEth(302).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'positionId',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'size',
      toEth(300).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'market',
      modifyPositionEvent.address.toHex()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'price',
      toEth(1200).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'positionSize',
      '400'
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'positionClosed',
      'false'
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'pnl',
      `0`
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'feesPaidToSynthetix',
      toEth(2).toString()
    );
    assert.fieldEquals(
      'FuturesTrade',
      `${modifyPositionEvent.transaction.hash.toHex() +
        '-' +
        modifyPositionEvent.logIndex.toString()}`,
      'type',
      'PositionModified'
    );
    assert.entityCount('FuturesTrade', 2);

    // FUTURES POSITION
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'id',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'account',
      trader.toLowerCase()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'margin',
      toEth(500).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'size',
      '400'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'lastPrice',
      toEth(1200).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'feesPaidToSynthetix',
      toEth(4).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'trades',
      '2'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'long',
      'true'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'isOpen',
      'true'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'isLiquidated',
      'false'
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'initialMargin',
      toEth(202).toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'pnl',
      `-${toEth(2).toString()}`
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'totalVolume',
      toEth(100)
        .times(toEth(1000).div(BigInt.fromI32(10).pow(18)))
        .plus(toEth(300).times(toEth(1200).div(BigInt.fromI32(10).pow(18))))
        .toString()
    );
    assert.fieldEquals(
      'FuturesPosition',
      `${modifyPositionEvent.address.toHex() + '-' + '0x1'}`,
      'openTimestamp',
      '10'
    );
    assert.entityCount('FuturesTrade', 2);
  });
});
