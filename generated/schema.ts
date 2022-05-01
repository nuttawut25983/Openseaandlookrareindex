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

export class transfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("contract", Value.fromString(""));
    this.set("transactionhash", Value.fromString(""));
    this.set("tokenId", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save transfer entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type transfer must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("transfer", id.toString(), this);
    }
  }

  static load(id: string): transfer | null {
    return changetype<transfer | null>(store.get("transfer", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get contract(): string {
    let value = this.get("contract");
    return value!.toString();
  }

  set contract(value: string) {
    this.set("contract", Value.fromString(value));
  }

  get transactionhash(): string {
    let value = this.get("transactionhash");
    return value!.toString();
  }

  set transactionhash(value: string) {
    this.set("transactionhash", Value.fromString(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get blockNum(): i32 {
    let value = this.get("blockNum");
    return value!.toI32();
  }

  set blockNum(value: i32) {
    this.set("blockNum", Value.fromI32(value));
  }

  get senderAddress(): Bytes | null {
    let value = this.get("senderAddress");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set senderAddress(value: Bytes | null) {
    if (!value) {
      this.unset("senderAddress");
    } else {
      this.set("senderAddress", Value.fromBytes(<Bytes>value));
    }
  }

  get receiverAddress(): Bytes | null {
    let value = this.get("receiverAddress");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set receiverAddress(value: Bytes | null) {
    if (!value) {
      this.unset("receiverAddress");
    } else {
      this.set("receiverAddress", Value.fromBytes(<Bytes>value));
    }
  }

  get price(): BigDecimal | null {
    let value = this.get("price");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigDecimal();
    }
  }

  set price(value: BigDecimal | null) {
    if (!value) {
      this.unset("price");
    } else {
      this.set("price", Value.fromBigDecimal(<BigDecimal>value));
    }
  }

  get platform(): string | null {
    let value = this.get("platform");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set platform(value: string | null) {
    if (!value) {
      this.unset("platform");
    } else {
      this.set("platform", Value.fromString(<string>value));
    }
  }

  get eventname(): string | null {
    let value = this.get("eventname");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set eventname(value: string | null) {
    if (!value) {
      this.unset("eventname");
    } else {
      this.set("eventname", Value.fromString(<string>value));
    }
  }

  get timestamp(): BigInt | null {
    let value = this.get("timestamp");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set timestamp(value: BigInt | null) {
    if (!value) {
      this.unset("timestamp");
    } else {
      this.set("timestamp", Value.fromBigInt(<BigInt>value));
    }
  }
}

export class collection extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("totalVolume", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("topSale", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save collection entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type collection must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("collection", id.toString(), this);
    }
  }

  static load(id: string): collection | null {
    return changetype<collection | null>(store.get("collection", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get totalSales(): i32 {
    let value = this.get("totalSales");
    return value!.toI32();
  }

  set totalSales(value: i32) {
    this.set("totalSales", Value.fromI32(value));
  }

  get totalVolume(): BigDecimal {
    let value = this.get("totalVolume");
    return value!.toBigDecimal();
  }

  set totalVolume(value: BigDecimal) {
    this.set("totalVolume", Value.fromBigDecimal(value));
  }

  get topSale(): BigDecimal {
    let value = this.get("topSale");
    return value!.toBigDecimal();
  }

  set topSale(value: BigDecimal) {
    this.set("topSale", Value.fromBigDecimal(value));
  }
}

export class token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("collection", Value.fromString(""));
    this.set("lastPrice", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("topSale", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("token", id.toString(), this);
    }
  }

  static load(id: string): token | null {
    return changetype<token | null>(store.get("token", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get collection(): string {
    let value = this.get("collection");
    return value!.toString();
  }

  set collection(value: string) {
    this.set("collection", Value.fromString(value));
  }

  get lastPrice(): BigDecimal {
    let value = this.get("lastPrice");
    return value!.toBigDecimal();
  }

  set lastPrice(value: BigDecimal) {
    this.set("lastPrice", Value.fromBigDecimal(value));
  }

  get topSale(): BigDecimal {
    let value = this.get("topSale");
    return value!.toBigDecimal();
  }

  set topSale(value: BigDecimal) {
    this.set("topSale", Value.fromBigDecimal(value));
  }
}
