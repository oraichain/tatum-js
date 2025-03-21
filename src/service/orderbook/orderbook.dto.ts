import { Event } from '@cosmjs/stargate'

import { TokenInfo } from '../common-info'

export interface OrderbookCosmosData {
    message: any
    events: Event[]
}

export interface OrderbookEvmData {
}

export interface TokenInfoExtend extends TokenInfo {
    amount: string
}

export interface OrderbookResponse {
    bidderAddress: string
    orderType: string
    orderDirection: string
    askAssetInfo: TokenInfoExtend | null
    offerAssetInfo: TokenInfoExtend
}