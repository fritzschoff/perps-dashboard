import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  OwnerChanged,
  OwnerNominated,
  RouteRemoved,
  RouteUpdated,
  TargetedRouteAdded,
  TargetedRouteRemoved
} from "../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable"

export function createOwnerChangedEvent(
  oldOwner: Address,
  newOwner: Address
): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent())

  ownerChangedEvent.parameters = new Array()

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerChangedEvent
}

export function createOwnerNominatedEvent(newOwner: Address): OwnerNominated {
  let ownerNominatedEvent = changetype<OwnerNominated>(newMockEvent())

  ownerNominatedEvent.parameters = new Array()

  ownerNominatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerNominatedEvent
}

export function createRouteRemovedEvent(route: Bytes): RouteRemoved {
  let routeRemovedEvent = changetype<RouteRemoved>(newMockEvent())

  routeRemovedEvent.parameters = new Array()

  routeRemovedEvent.parameters.push(
    new ethereum.EventParam("route", ethereum.Value.fromFixedBytes(route))
  )

  return routeRemovedEvent
}

export function createRouteUpdatedEvent(
  route: Bytes,
  implementation: Address,
  isView: boolean
): RouteUpdated {
  let routeUpdatedEvent = changetype<RouteUpdated>(newMockEvent())

  routeUpdatedEvent.parameters = new Array()

  routeUpdatedEvent.parameters.push(
    new ethereum.EventParam("route", ethereum.Value.fromFixedBytes(route))
  )
  routeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )
  routeUpdatedEvent.parameters.push(
    new ethereum.EventParam("isView", ethereum.Value.fromBoolean(isView))
  )

  return routeUpdatedEvent
}

export function createTargetedRouteAddedEvent(
  targetedRoute: Address
): TargetedRouteAdded {
  let targetedRouteAddedEvent = changetype<TargetedRouteAdded>(newMockEvent())

  targetedRouteAddedEvent.parameters = new Array()

  targetedRouteAddedEvent.parameters.push(
    new ethereum.EventParam(
      "targetedRoute",
      ethereum.Value.fromAddress(targetedRoute)
    )
  )

  return targetedRouteAddedEvent
}

export function createTargetedRouteRemovedEvent(
  targetedRoute: Address
): TargetedRouteRemoved {
  let targetedRouteRemovedEvent = changetype<TargetedRouteRemoved>(
    newMockEvent()
  )

  targetedRouteRemovedEvent.parameters = new Array()

  targetedRouteRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "targetedRoute",
      ethereum.Value.fromAddress(targetedRoute)
    )
  )

  return targetedRouteRemovedEvent
}
