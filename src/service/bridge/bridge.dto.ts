import { Event } from '@cosmjs/stargate'

export interface CosmosTransferToRemoteData {
  message: any
  events: Event[]
}

export interface EvmTransferToRemoteData {
  txHash: string
}

export interface TransferToRemoteResponse {
  /**
   * address of local chain
   */
  fromAddress: string
  /**
   * address of remote chain
   */
  toAddress: string
  bridgeAmount: string
  feeAmount: string
}
