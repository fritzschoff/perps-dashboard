import { newMockEvent } from 'matchstick-as';
import { ethereum, Address, Bytes } from '@graphprotocol/graph-ts';
import {
  OwnerChanged,
  OwnerNominated,
  RouteRemoved,
  RouteUpdated,
  TargetedRouteAdded,
  TargetedRouteRemoved,
} from '../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable';

export function createOwnerChangedEvent(
  oldOwner: Address,
  newOwner: Address
): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent());

  ownerChangedEvent.parameters = new Array();

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam('oldOwner', ethereum.Value.fromAddress(oldOwner))
  );
  ownerChangedEvent.parameters.push(
    new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(newOwner))
  );

  return ownerChangedEvent;
}
