import { Event } from '@cosmjs/stargate'

import { TokenInfo } from '../common-info'

export interface OpenOrderbookCosmosData {
    message: any
    events: Event[]
}

export interface CloseOrderbookCosmosData extends OpenOrderbookCosmosData { }

export interface OpenOrderbookEvmData {
}

export interface TokenInfoExtend extends TokenInfo {
    amount: string
}

export interface OpenOrderbookResponse {
    bidderAddress: string
    orderType: string
    orderDirection: string
    askAssetInfo: TokenInfoExtend | null
    offerAssetInfo: TokenInfoExtend
}

export interface CloseOrderbookResponse extends Omit<OpenOrderbookResponse, "orderType"> { }