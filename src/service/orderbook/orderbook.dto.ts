import { Event } from '@cosmjs/stargate'

export interface OrderbookCosmosData {
    message: any
    events: Event[]
}

export interface OrderbookEvmData {
}

export interface OrderbookResponse { }