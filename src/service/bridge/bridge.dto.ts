import { Event } from '@cosmjs/stargate'

import { ChainInfo, TokenInfo } from '../common-info'

export interface CosmosTransferToRemoteData {
  message: any
  events: Event[]
}

export interface EvmTransferToRemoteData {
  txHash: string
}

export interface ChainInfoWithoutCurrency extends Omit<ChainInfo, 'currencies'> {}

export interface TransferToRemoteResponse {
  /**
   * address of local chain
   */
  fromAddress: string
  /**
   * address of remote chain
   */
  toAddress: string
  fromChain: ChainInfoWithoutCurrency
  toChain: ChainInfoWithoutCurrency
  bridgeAmount: string
  feeAmount: string
  tokenInfo: TokenInfo
}

export interface CosmosBridgeSolanaData extends CosmosTransferToRemoteData {}
export interface BridgeSolanaResponse extends TransferToRemoteResponse {}

export interface CosmosIbcData extends CosmosTransferToRemoteData {}
export interface IbcDataResponse extends TransferToRemoteResponse {}

export interface BridgeTonData extends CosmosTransferToRemoteData {}
export interface BridgeTonDataResponse extends TransferToRemoteResponse {}
