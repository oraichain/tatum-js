import { Event } from '@cosmjs/stargate'

import { ChainInfo, TokenInfo } from '../common-info'

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
  fromChain: ChainInfo
  toChain: ChainInfo
  bridgeAmount: string
  feeAmount: string
  tokenInfo: TokenInfo
}
