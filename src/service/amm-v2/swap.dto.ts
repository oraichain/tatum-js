import { Event } from '@cosmjs/stargate'

export interface CosmosSwapData {
  message: any
  events: Event[]
}

export interface EvmSwapData {
  evmMessage: any
}

export interface SwapResponse {
  /**
   * Blockchain address of the balance.
   */
  fromAddress: string
  /**
   * Blockchain address of the balance.
   */
  toAddress: string
  inAmount: string
  outAmount: string
  minimumReceive: string
  /**
   * Decimals of the asset. Valid for native and fungible tokens. For tokens, only when readable from the contract `decimals()` method.
   */
  decimals: number
}
