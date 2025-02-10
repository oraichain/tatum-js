import { Event } from '@cosmjs/stargate'

export interface OraiSwapData {
  message: any
  events: readonly Event[]
}

export interface OraiSwapResponse {
  contractAddress: string
  fromAddress: string
  poolKey: string
  x_to_y: string
  amountIn: string
  amountOut: string
  currentTick: string
  currentSqrtPrice: string
  liquidity: string
}

export interface EvmSwapData {
  evmMessage: any
}

export interface EvmSwapResponse {}

export type SwapResponse = OraiSwapResponse | EvmSwapResponse;

// export interface SwapResponse {
//   /**
//    * Blockchain address of the balance.
//    */
//   fromAddress: string
//   /**
//    * Blockchain address of the balance.
//    */
//   toAddress: string
//   inAmount: string
//   outAmount: string
//   minimumReceive: string
//   /**
//    * Decimals of the asset. Valid for native and fungible tokens. For tokens, only when readable from the contract `decimals()` method.
//    */
//   decimals: number
// }
