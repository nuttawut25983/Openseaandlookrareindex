import {ethereum, Address, BigInt, Bytes, BigDecimal} from "@graphprotocol/graph-ts"
import {
    TakerBid
} from "../generated/LooksRare/LooksRare"
import {
    token,
    collection,
    transfer,
} from "../generated/schema"
import { AtomicMatch_Call, WyvernExchangeV1 } from "../generated/WyvernExchangeV1/WyvernExchangeV1"
import { NULL_ADDRESS, WYVERN_EXCHANGE_ADDRESS, WYVERN_ATOMICIZER_ADDRESS, TRANSFER_FROM_SELECTOR } from  "./constants"
import {OpenseaService} from "./modules/opnesea";

export function handleTakerBid(event: TakerBid): void {

    let transferAmount = event.params.price.divDecimal(BigDecimal.fromString('1000000000000000000'))


    let collectionEntity = collection.load(event.params.collection.toHex())

    if (!collectionEntity) {

        collectionEntity = new collection(event.params.collection.toHex())

        collectionEntity.id = event.params.collection.toHex()

        collectionEntity.totalSales = 0
        collectionEntity.totalVolume = BigDecimal.fromString('0')
        collectionEntity.topSale = BigDecimal.fromString('0')

        collectionEntity.save()
    }

    let tokenEntity = token.load((collectionEntity.id.toString() + '-' + event.params.tokenId.toString()))

    if (!tokenEntity) {

        tokenEntity = new token(event.params.tokenId.toString())

        tokenEntity.id = (event.params.tokenId.toHex())

        tokenEntity.collection = event.params.collection.toHex()
        tokenEntity.lastPrice = BigDecimal.fromString('0')
        tokenEntity.topSale = BigDecimal.fromString('0')

        tokenEntity.save()
    }

    let transferEntity = transfer.load(event.transaction.hash.toHex())

    if (!transferEntity) {
        transferEntity = new transfer(event.transaction.from.toHex())
        transferEntity.id = (event.params.collection.toHex() + '-' + event.params.tokenId.toString())
        transferEntity.contract = event.params.collection.toHex()
        transferEntity.timestamp = event.block.timestamp
        transferEntity.transactionhash = event.transaction.hash.toHex()
        transferEntity.tokenId = event.params.tokenId.toString()
        transferEntity.blockNum = event.block.number.toI32()
        transferEntity.senderAddress = event.params.taker
        transferEntity.receiverAddress = event.params.maker
        transferEntity.price = transferAmount
        transferEntity.platform = 'LooksRare'
        transferEntity.eventname = 'Sale'
    }


    transferEntity.save()
    tokenEntity.save()
    collectionEntity.save()

}

export function handleAtomicMatchV1(call: AtomicMatch_Call): void {
    let addrs: Address[] = call.inputs.addrs;
    let saleAdress: Address = addrs[11];
    let saleTargetAddressStr: string = saleAdress.toHexString();

    let callInputs = call.inputs;
    let uints: BigInt[] = callInputs.uints;

    let feeMethodsSidesKindsHowToCalls =
        callInputs.feeMethodsSidesKindsHowToCalls;
    let price: BigInt = OpenseaService._calculateMatchPrice(
        feeMethodsSidesKindsHowToCalls[1],
        feeMethodsSidesKindsHowToCalls[2],
        uints[4],
        uints[5],
        uints[6],
        uints[7],
        feeMethodsSidesKindsHowToCalls[5],
        feeMethodsSidesKindsHowToCalls[6],
        uints[13],
        uints[14],
        uints[15],
        uints[16],
        addrs[10]
    );

    let nftAddrs: Address = addrs[11];
    let nftAddrsStr: string = nftAddrs.toHexString();

    let buyerAdress: Address = addrs[1]; // Buyer.maker
    let sellerAdress: Address = addrs[8]; // Saler.maker
    let paymentTokenErc20Address: Address = addrs[6];
    let mergedCallData = OpenseaService._guardedArrayReplace(
        callInputs.calldataBuy,
        callInputs.calldataSell,
        callInputs.replacementPatternBuy
    );

    let tokenIdStr = OpenseaService._getSingleTokenIdFromTransferFromCallData(mergedCallData);

    let transferAmount = price.divDecimal(BigDecimal.fromString('1000000000000000000'))


    let transferEntity = transfer.load(call.transaction.hash.toHex())

    if (!transferEntity) {
        transferEntity = new transfer(call.transaction.hash.toHex())
        transferEntity.id = (nftAddrsStr + '-' + tokenIdStr)
        transferEntity.contract = nftAddrsStr
        transferEntity.timestamp = call.block.timestamp
        transferEntity.transactionhash = call.transaction.hash.toHex()
        transferEntity.tokenId = tokenIdStr
        transferEntity.blockNum = call.block.number.toI32()
        transferEntity.senderAddress = sellerAdress
        transferEntity.receiverAddress = buyerAdress
        transferEntity.price = transferAmount
        transferEntity.platform = 'OpenSeaV1'
        transferEntity.eventname = 'Sale'
    }

    let collectionEntity = collection.load(nftAddrsStr)

    if (!collectionEntity) {

        collectionEntity = new collection(nftAddrsStr)

        collectionEntity.id = nftAddrsStr

        collectionEntity.totalSales = 0
        collectionEntity.totalVolume = BigDecimal.fromString('0')
        collectionEntity.topSale = BigDecimal.fromString('0')

        collectionEntity.save()
    }

    let tokenEntity = token.load(tokenIdStr)

    if (!tokenEntity) {

        tokenEntity = new token(tokenIdStr)

        tokenEntity.id = (tokenIdStr)

        tokenEntity.collection = tokenIdStr
        tokenEntity.lastPrice = BigDecimal.fromString('0')
        tokenEntity.topSale = BigDecimal.fromString('0')

        tokenEntity.save()
    }

    collectionEntity.totalSales = collectionEntity.totalSales + 1
    collectionEntity.totalVolume = collectionEntity.totalVolume.plus(transferAmount)
    if (transferAmount > collectionEntity.topSale) {
        collectionEntity.topSale = transferAmount
    }

    tokenEntity.lastPrice = transferAmount
    if (transferAmount > tokenEntity.topSale) {
        tokenEntity.topSale = transferAmount
    }


    transferEntity.save()
    tokenEntity.save()
    collectionEntity.save()
}

export function handleAtomicMatchV2(call: AtomicMatch_Call): void {
    let addrs: Address[] = call.inputs.addrs;
    let saleAdress: Address = addrs[11];
    let saleTargetAddressStr: string = saleAdress.toHexString();

    let callInputs = call.inputs;
    let uints: BigInt[] = callInputs.uints;

    let feeMethodsSidesKindsHowToCalls =
        callInputs.feeMethodsSidesKindsHowToCalls;
    let price: BigInt = OpenseaService._calculateMatchPrice(
        feeMethodsSidesKindsHowToCalls[1],
        feeMethodsSidesKindsHowToCalls[2],
        uints[4],
        uints[5],
        uints[6],
        uints[7],
        feeMethodsSidesKindsHowToCalls[5],
        feeMethodsSidesKindsHowToCalls[6],
        uints[13],
        uints[14],
        uints[15],
        uints[16],
        addrs[10]
    );

    let nftAddrs: Address = addrs[11];
    let nftAddrsStr: string = nftAddrs.toHexString();

    let buyerAdress: Address = addrs[1]; // Buyer.maker
    let sellerAdress: Address = addrs[8]; // Saler.maker
    let paymentTokenErc20Address: Address = addrs[6];
    let mergedCallData = OpenseaService._guardedArrayReplace(
        callInputs.calldataBuy,
        callInputs.calldataSell,
        callInputs.replacementPatternBuy
    );

    let tokenIdStr = OpenseaService._getSingleTokenIdFromTransferFromCallData(mergedCallData);

    let transferAmount = price.divDecimal(BigDecimal.fromString('1000000000000000000'))


    let transferEntity = transfer.load(call.transaction.hash.toHex())

    if (!transferEntity) {
        transferEntity = new transfer(call.transaction.hash.toHex())
        transferEntity.id = (nftAddrsStr + '-' + tokenIdStr)
        transferEntity.contract = nftAddrsStr
        transferEntity.timestamp = call.block.timestamp
        transferEntity.transactionhash = call.transaction.hash.toHex()
        transferEntity.tokenId = tokenIdStr
        transferEntity.blockNum = call.block.number.toI32()
        transferEntity.senderAddress = sellerAdress
        transferEntity.receiverAddress = buyerAdress
        transferEntity.price = transferAmount
        transferEntity.platform = 'OpenSeaV2'
        transferEntity.eventname = 'Sale'
    }


    let collectionEntity = collection.load(nftAddrsStr)

    if (!collectionEntity) {

        collectionEntity = new collection(nftAddrsStr)

        collectionEntity.id = nftAddrsStr

        collectionEntity.totalSales = 0
        collectionEntity.totalVolume = BigDecimal.fromString('0')
        collectionEntity.topSale = BigDecimal.fromString('0')

        collectionEntity.save()
    }

    let tokenEntity = token.load(tokenIdStr)

    if (!tokenEntity) {

        tokenEntity = new token(tokenIdStr)

        tokenEntity.id = (tokenIdStr)

        tokenEntity.collection = tokenIdStr
        tokenEntity.lastPrice = BigDecimal.fromString('0')
        tokenEntity.topSale = BigDecimal.fromString('0')

        tokenEntity.save()
    }

    collectionEntity.totalSales = collectionEntity.totalSales + 1
    collectionEntity.totalVolume = collectionEntity.totalVolume.plus(transferAmount)
    if (transferAmount > collectionEntity.topSale) {
        collectionEntity.topSale = transferAmount
    }

    tokenEntity.lastPrice = transferAmount
    if (transferAmount > tokenEntity.topSale) {
        tokenEntity.topSale = transferAmount
    }


    transferEntity.save()
    tokenEntity.save()
    collectionEntity.save()
}
