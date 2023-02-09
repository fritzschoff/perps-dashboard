import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { OwnerChanged } from "../generated/schema"
import { OwnerChanged as OwnerChangedEvent } from "../generated/PerpsV2MarketProxyable/PerpsV2MarketProxyable"
import { handleOwnerChanged } from "../src/perps-v-2-market-proxyable"
import { createOwnerChangedEvent } from "./perps-v-2-market-proxyable-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let oldOwner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newOwner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newOwnerChangedEvent = createOwnerChangedEvent(oldOwner, newOwner)
    handleOwnerChanged(newOwnerChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OwnerChanged created and stored", () => {
    assert.entityCount("OwnerChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OwnerChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oldOwner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "OwnerChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newOwner",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
