import {Address, BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";
import {AtomicMatch_Call, WyvernExchangeV1} from "../../generated/WyvernExchangeV1/WyvernExchangeV1";
import {NULL_ADDRESS, TRANSFER_FROM_SELECTOR, WYVERN_EXCHANGE_ADDRESS} from "../constants";


export class OpenseaService {


    /** Private implementation */

    /**
     *
     * @param call The AtomicMatch call that triggered the handleAtomicMatch_ call handler.
     * @description This function is used to handle the case of a "normal" sale made from OpenSea.
     *              A "normal" sale is a sale that is not a bundle (only contains one asset).
     */


    _handleSingleAssetSale(call: AtomicMatch_Call): void {


        // Create the associated entry in the Nft <=> OpenSeaSale lookup table
        // let tableEntryId = openSeaSaleId + "<=>" + completeNftId;
        // let nftOpenSeaSaleLookupTable = new NftOpenSeaSaleLookupTable(tableEntryId);
        // nftOpenSeaSaleLookupTable.nft = nft.id;
        // nftOpenSeaSaleLookupTable.openSeaSale = openSeaSale.id;
        // nftOpenSeaSaleLookupTable.save();
    }

    /**
     *
     * @param call The AtomicMatch call that triggered the handleAtomicMatch_ call handler.
     * @description This function is used to handle the case of a "bundle" sale made from OpenSea.
     *              A "bundle" sale is a sale that contains several assets embeded in the same, atomic, transaction.
     */

    /**
     * Replace bytes in an array with bytes in another array, guarded by a bitmask
     *
     * @param array The original array
     * @param replacement The replacement array
     * @param mask The mask specifying which bits can be changed in the original array
     * @returns The updated byte array
     */


    static _guardedArrayReplace(
        array: Bytes,
        replacement: Bytes,
        mask: Bytes
    ): Bytes {
        array.reverse();
        replacement.reverse();
        mask.reverse();

        let bigIntgArray = BigInt.fromUnsignedBytes(array);
        let bigIntReplacement = BigInt.fromUnsignedBytes(replacement);
        let bigIntMask = BigInt.fromUnsignedBytes(mask);

        // array |= replacement & mask;
        bigIntReplacement = bigIntReplacement.bitAnd(bigIntMask);
        bigIntgArray = bigIntgArray.bitOr(bigIntReplacement);
        // let callDataHexString = bigIntgArray.toHexString();
        return changetype<Bytes>(Bytes.fromBigInt(bigIntgArray).reverse());
    }

    /**
     *
     * @param atomicizeCallData The ABI encoded atomicize method call used by OpenSea Smart library (WyvernAtomicizer)
     *                          to trigger bundle sales (looping over NFT and calling transferFrom for each)
     * @returns An array of 2 cells: [listOfContractAddress][listOfTokenId]
     */


    static _getNftContractAddressAndTokenIdFromCallData(
        atomicizeCallData: Bytes
    ): string[][] {
        let dataWithoutFunctionSelector: Bytes = changetype<Bytes>(
            atomicizeCallData.subarray(4)
        );

        // As function encoding is not handled yet by the lib, we first need to reach the offset of where the
        // actual params are located. As they are all dynamic we can just fetch the offset of the first param
        // and then start decoding params from there as known sized types
        let offset: i32 = ethereum
            .decode("uint256", changetype<Bytes>(dataWithoutFunctionSelector))!
            .toBigInt()
            .toI32();

        // Get the length of the first array. All arrays must have same length so fetching only this one is enough
        let arrayLength: i32 = ethereum
            .decode(
                "uint256",
                changetype<Bytes>(dataWithoutFunctionSelector.subarray(offset))
            )!
            .toBigInt()
            .toI32();
        offset += 1 * 32;

        // Now that we know the size of each params we can decode them one by one as know sized types
        // function atomicize(address[] addrs,uint256[] values,uint256[] calldataLengths,bytes calldatas)
        let decodedAddresses: Address[] = ethereum
            .decode(
                `address[${arrayLength}]`,
                changetype<Bytes>(dataWithoutFunctionSelector.subarray(offset))
            )!
            .toAddressArray();
        offset += arrayLength * 32;

        offset += 1 * 32;
        // We don't need those values, just move the offset forward
        // let decodedValues: BigInt[] = ethereum.decode(
        //   `uint256[${arrayLength}]`,
        //   changetype<Bytes>(dataWithoutFunctionSelector.subarray(offset))
        // )!.toBigIntArray();
        offset += arrayLength * 32;

        offset += 1 * 32;
        let decodedCalldataIndividualLengths = ethereum
            .decode(
                `uint256[${arrayLength}]`,
                changetype<Bytes>(dataWithoutFunctionSelector.subarray(offset))
            )!
            .toBigIntArray()
            .map<i32>(e => e.toI32());
        offset += arrayLength * 32;

        let decodedCallDatasLength = ethereum
            .decode(
                "uint256",
                changetype<Bytes>(dataWithoutFunctionSelector.subarray(offset))
            )!
            .toBigInt()
            .toI32();
        offset += 1 * 32;

        let callDatas: Bytes = changetype<Bytes>(
            dataWithoutFunctionSelector.subarray(
                offset,
                offset + decodedCallDatasLength
            )
        );

        let nftContractsAddrsList: string[] = [];
        let tokenIds: string[] = [];

        let calldataOffset = 0;
        for (let i = 0; i < decodedAddresses.length; i++) {
            let callDataLength = decodedCalldataIndividualLengths[i];
            let calldata: Bytes = changetype<Bytes>(
                callDatas.subarray(calldataOffset, calldataOffset + callDataLength)
            );

            // Sometime the call data is not a transferFrom (ie: https://etherscan.io/tx/0xe8629bfc57ab619a442f027c46d63e1f101bd934232405fa8e8eaf156bfca848)
            // Ignore if not transferFrom
            let functionSelector: string = changetype<Bytes>(
                calldata.subarray(0, 4)
            ).toHexString();

            if (functionSelector == TRANSFER_FROM_SELECTOR) {
                nftContractsAddrsList.push(decodedAddresses[i].toHexString());
                tokenIds.push(OpenseaService._getSingleTokenIdFromTransferFromCallData(calldata));
            }

            calldataOffset += callDataLength;
        }

        return [nftContractsAddrsList, tokenIds];
    }

    /**
     *
     * @param transferFromData The ABI encoded transferFrom method call used by OpenSea Smart contract
     *                 to trigger the Nft transfer between the seller and the buyer
     * @returns The tokenId (string) of the transfer
     */


    static _getSingleTokenIdFromTransferFromCallData(
        transferFromData: Bytes
    ): string {
        let dataWithoutFunctionSelector = changetype<Bytes>(
            transferFromData.subarray(4)
        );

        let decoded = ethereum
            .decode("(address,address,uint256)", dataWithoutFunctionSelector)!
            .toTuple();
        return decoded[2].toBigInt().toString();
    }

    /**
     *
     * @param completeNftId The compleye NFT Id to load
     * @returns The feteched/created Nft entity
     */
// function _loadOrCreateNFT(completeNftId: string): Nft {
//   let nft = Nft.load(completeNftId);
//
//   if (nft == null) {
//     nft = new Nft(completeNftId);
//     nft.save();
//   }
//
//   return nft as Nft;
// }


    /**
     * Necessary function because of graph bugs whe calling `calculateMatchPrice_` of WyvernExchange, see: https://github.com/graphprotocol/graph-ts/issues/211
     * @param buySide See `calculateFinalPrice` of WyvernExchange
     * @param buySaleKind See `calculateFinalPrice` of WyvernExchange
     * @param buyBasePrice See `calculateFinalPrice` of WyvernExchange
     * @param buyExtra See `calculateFinalPrice` of WyvernExchange
     * @param buyListingTime See `calculateFinalPrice` of WyvernExchange
     * @param buyExprirationTime See `calculateFinalPrice` of WyvernExchange
     * @param sellSide See `calculateFinalPrice` of WyvernExchange
     * @param sellSaleKind See `calculateFinalPrice` of WyvernExchange
     * @param sellBasePrice See `calculateFinalPrice` of WyvernExchange
     * @param sellExtra See `calculateFinalPrice` of WyvernExchange
     * @param sellListingTime See `calculateFinalPrice` of WyvernExchange
     * @param sellExprirationTime See `calculateFinalPrice` of WyvernExchange
     * @param sellFeeRecipient See `calculateFinalPrice` of WyvernExchange
     * @returns The match price of the given buy and sell orders
     */


    static _calculateMatchPrice(
        buySide: i32,
        buySaleKind: i32,
        buyBasePrice: BigInt,
        buyExtra: BigInt,
        buyListingTime: BigInt,
        buyExprirationTime: BigInt,
        sellSide: i32,
        sellSaleKind: i32,
        sellBasePrice: BigInt,
        sellExtra: BigInt,
        sellListingTime: BigInt,
        sellExprirationTime: BigInt,
        sellFeeRecipient: Address
    ): BigInt {

        let sellPrice = OpenseaService._calculateFinalPrice(
            sellSide,
            sellSaleKind,
            sellBasePrice,
            sellExtra,
            sellListingTime,
            sellExprirationTime
        );

        let buyPrice = OpenseaService._calculateFinalPrice(
            buySide,
            buySaleKind,
            buyBasePrice,
            buyExtra,
            buyListingTime,
            buyExprirationTime
        );

        return sellFeeRecipient.toHexString() != NULL_ADDRESS ? sellPrice : buyPrice;
    }

    /**
     * @param side See `calculateFinalPrice` of WyvernExchange
     * @param saleKind See `calculateFinalPrice` of WyvernExchange
     * @param basePrice See `calculateFinalPrice` of WyvernExchange
     * @param extra See `calculateFinalPrice` of WyvernExchange
     * @param listingTime See `calculateFinalPrice` of WyvernExchange
     * @param exprirationTime See `calculateFinalPrice` of WyvernExchange
     * @returns The final price of the given order params. The price is computed from the contract method
     */


     static _calculateFinalPrice(
        side: i32,
        saleKind: i32,
        basePrice: BigInt,
        extra: BigInt,
        listingTime: BigInt,
        exprirationTime: BigInt
    ): BigInt {
        let wyvern = WyvernExchangeV1.bind(
            changetype<Address>(Address.fromHexString(WYVERN_EXCHANGE_ADDRESS))
        );
        return wyvern.calculateFinalPrice(
            side,
            saleKind,
            basePrice,
            extra,
            listingTime,
            exprirationTime
        );
    }

    /**
     * @param contractAddress The NFT contract address
     * @param tokenId The token ID
     * @returns The complete NFTID: contractAddress-tokenId
     */



    generateContractSpecificId(
        contractAddress: string,
        tokenId: string
    ): string {
        return contractAddress + "-" + tokenId;


    }

}
