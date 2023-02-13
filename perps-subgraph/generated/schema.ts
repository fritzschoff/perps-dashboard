// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class PositionLiquidated extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PositionLiquidated entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type PositionLiquidated must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PositionLiquidated", id.toString(), this);
    }
  }

  static load(id: string): PositionLiquidated | null {
    return changetype<PositionLiquidated | null>(
      store.get("PositionLiquidated", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value!.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get liquidator(): Bytes {
    let value = this.get("liquidator");
    return value!.toBytes();
  }

  set liquidator(value: Bytes) {
    this.set("liquidator", Value.fromBytes(value));
  }

  get size(): BigDecimal {
    let value = this.get("size");
    return value!.toBigDecimal();
  }

  set size(value: BigDecimal) {
    this.set("size", Value.fromBigDecimal(value));
  }

  get price(): BigDecimal {
    let value = this.get("price");
    return value!.toBigDecimal();
  }

  set price(value: BigDecimal) {
    this.set("price", Value.fromBigDecimal(value));
  }

  get fee(): BigDecimal {
    let value = this.get("fee");
    return value!.toBigDecimal();
  }

  set fee(value: BigDecimal) {
    this.set("fee", Value.fromBigDecimal(value));
  }

  get block(): BigInt {
    let value = this.get("block");
    return value!.toBigInt();
  }

  set block(value: BigInt) {
    this.set("block", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class Trader extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Trader entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Trader must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Trader", id.toString(), this);
    }
  }

  static load(id: string): Trader | null {
    return changetype<Trader | null>(store.get("Trader", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get totalLiquidations(): BigInt {
    let value = this.get("totalLiquidations");
    return value!.toBigInt();
  }

  set totalLiquidations(value: BigInt) {
    this.set("totalLiquidations", Value.fromBigInt(value));
  }

  get totalMarginLiquidated(): BigDecimal {
    let value = this.get("totalMarginLiquidated");
    return value!.toBigDecimal();
  }

  set totalMarginLiquidated(value: BigDecimal) {
    this.set("totalMarginLiquidated", Value.fromBigDecimal(value));
  }

  get feesPaidToSynthetix(): BigDecimal {
    let value = this.get("feesPaidToSynthetix");
    return value!.toBigDecimal();
  }

  set feesPaidToSynthetix(value: BigDecimal) {
    this.set("feesPaidToSynthetix", Value.fromBigDecimal(value));
  }

  get pnl(): BigInt {
    let value = this.get("pnl");
    return value!.toBigInt();
  }

  set pnl(value: BigInt) {
    this.set("pnl", Value.fromBigInt(value));
  }

  get trades(): Array<string> | null {
    let value = this.get("trades");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set trades(value: Array<string> | null) {
    if (!value) {
      this.unset("trades");
    } else {
      this.set("trades", Value.fromStringArray(<Array<string>>value));
    }
  }
}

export class FuturesTrade extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save FuturesTrade entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type FuturesTrade must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("FuturesTrade", id.toString(), this);
    }
  }

  static load(id: string): FuturesTrade | null {
    return changetype<FuturesTrade | null>(store.get("FuturesTrade", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value!.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get margin(): BigInt {
    let value = this.get("margin");
    return value!.toBigInt();
  }

  set margin(value: BigInt) {
    this.set("margin", Value.fromBigInt(value));
  }

  get size(): BigInt {
    let value = this.get("size");
    return value!.toBigInt();
  }

  set size(value: BigInt) {
    this.set("size", Value.fromBigInt(value));
  }

  get asset(): string {
    let value = this.get("asset");
    return value!.toString();
  }

  set asset(value: string) {
    this.set("asset", Value.fromString(value));
  }

  get market(): string {
    let value = this.get("market");
    return value!.toString();
  }

  set market(value: string) {
    this.set("market", Value.fromString(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get positionSize(): BigInt {
    let value = this.get("positionSize");
    return value!.toBigInt();
  }

  set positionSize(value: BigInt) {
    this.set("positionSize", Value.fromBigInt(value));
  }

  get positionClosed(): boolean {
    let value = this.get("positionClosed");
    return value!.toBoolean();
  }

  set positionClosed(value: boolean) {
    this.set("positionClosed", Value.fromBoolean(value));
  }

  get pnl(): BigInt {
    let value = this.get("pnl");
    return value!.toBigInt();
  }

  set pnl(value: BigInt) {
    this.set("pnl", Value.fromBigInt(value));
  }

  get feesPaidToSynthetix(): BigInt {
    let value = this.get("feesPaidToSynthetix");
    return value!.toBigInt();
  }

  set feesPaidToSynthetix(value: BigInt) {
    this.set("feesPaidToSynthetix", Value.fromBigInt(value));
  }

  get txHash(): string {
    let value = this.get("txHash");
    return value!.toString();
  }

  set txHash(value: string) {
    this.set("txHash", Value.fromString(value));
  }
}

export class Synthetix extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Synthetix entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Synthetix must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Synthetix", id.toString(), this);
    }
  }

  static load(id: string): Synthetix | null {
    return changetype<Synthetix | null>(store.get("Synthetix", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get feesByLiquidations(): BigDecimal {
    let value = this.get("feesByLiquidations");
    return value!.toBigDecimal();
  }

  set feesByLiquidations(value: BigDecimal) {
    this.set("feesByLiquidations", Value.fromBigDecimal(value));
  }

  get feesByPositionModifications(): BigDecimal {
    let value = this.get("feesByPositionModifications");
    return value!.toBigDecimal();
  }

  set feesByPositionModifications(value: BigDecimal) {
    this.set("feesByPositionModifications", Value.fromBigDecimal(value));
  }

  get totalVolume(): BigDecimal {
    let value = this.get("totalVolume");
    return value!.toBigDecimal();
  }

  set totalVolume(value: BigDecimal) {
    this.set("totalVolume", Value.fromBigDecimal(value));
  }
}

export class Partner extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Partner entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Partner must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Partner", id.toString(), this);
    }
  }

  static load(id: string): Partner | null {
    return changetype<Partner | null>(store.get("Partner", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tradeCount(): BigInt {
    let value = this.get("tradeCount");
    return value!.toBigInt();
  }

  set tradeCount(value: BigInt) {
    this.set("tradeCount", Value.fromBigInt(value));
  }
}

export class FuturesPosition extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save FuturesPosition entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type FuturesPosition must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("FuturesPosition", id.toString(), this);
    }
  }

  static load(id: string): FuturesPosition | null {
    return changetype<FuturesPosition | null>(store.get("FuturesPosition", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value!.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get openTimestamp(): BigInt {
    let value = this.get("openTimestamp");
    return value!.toBigInt();
  }

  set openTimestamp(value: BigInt) {
    this.set("openTimestamp", Value.fromBigInt(value));
  }

  get closeTimestamp(): BigInt | null {
    let value = this.get("closeTimestamp");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set closeTimestamp(value: BigInt | null) {
    if (!value) {
      this.unset("closeTimestamp");
    } else {
      this.set("closeTimestamp", Value.fromBigInt(<BigInt>value));
    }
  }

  get long(): boolean {
    let value = this.get("long");
    return value!.toBoolean();
  }

  set long(value: boolean) {
    this.set("long", Value.fromBoolean(value));
  }

  get market(): string {
    let value = this.get("market");
    return value!.toString();
  }

  set market(value: string) {
    this.set("market", Value.fromString(value));
  }

  get asset(): string {
    let value = this.get("asset");
    return value!.toString();
  }

  set asset(value: string) {
    this.set("asset", Value.fromString(value));
  }

  get isOpen(): boolean {
    let value = this.get("isOpen");
    return value!.toBoolean();
  }

  set isOpen(value: boolean) {
    this.set("isOpen", Value.fromBoolean(value));
  }

  get isLiquidated(): boolean {
    let value = this.get("isLiquidated");
    return value!.toBoolean();
  }

  set isLiquidated(value: boolean) {
    this.set("isLiquidated", Value.fromBoolean(value));
  }

  get trades(): BigInt {
    let value = this.get("trades");
    return value!.toBigInt();
  }

  set trades(value: BigInt) {
    this.set("trades", Value.fromBigInt(value));
  }

  get size(): BigInt {
    let value = this.get("size");
    return value!.toBigInt();
  }

  set size(value: BigInt) {
    this.set("size", Value.fromBigInt(value));
  }

  get initialMargin(): BigInt {
    let value = this.get("initialMargin");
    return value!.toBigInt();
  }

  set initialMargin(value: BigInt) {
    this.set("initialMargin", Value.fromBigInt(value));
  }

  get margin(): BigInt {
    let value = this.get("margin");
    return value!.toBigInt();
  }

  set margin(value: BigInt) {
    this.set("margin", Value.fromBigInt(value));
  }

  get pnl(): BigInt {
    let value = this.get("pnl");
    return value!.toBigInt();
  }

  set pnl(value: BigInt) {
    this.set("pnl", Value.fromBigInt(value));
  }

  get totalVolume(): BigInt {
    let value = this.get("totalVolume");
    return value!.toBigInt();
  }

  set totalVolume(value: BigInt) {
    this.set("totalVolume", Value.fromBigInt(value));
  }

  get entryPrice(): BigInt {
    let value = this.get("entryPrice");
    return value!.toBigInt();
  }

  set entryPrice(value: BigInt) {
    this.set("entryPrice", Value.fromBigInt(value));
  }

  get lastPrice(): BigInt {
    let value = this.get("lastPrice");
    return value!.toBigInt();
  }

  set lastPrice(value: BigInt) {
    this.set("lastPrice", Value.fromBigInt(value));
  }

  get exitPrice(): BigInt | null {
    let value = this.get("exitPrice");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set exitPrice(value: BigInt | null) {
    if (!value) {
      this.unset("exitPrice");
    } else {
      this.set("exitPrice", Value.fromBigInt(<BigInt>value));
    }
  }
}
