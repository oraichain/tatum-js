import { Event } from '@cosmjs/stargate'

export interface CosmosTransferToRemoteData {
  message: any
  events: Event[]
}

export interface TransferToRemoteResponse {}
