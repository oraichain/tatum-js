import { Event } from '@cosmjs/stargate'

export interface OraiSwapData {
  sender: string
  message: any
  events: readonly Event[]
}

export interface OraiSwapOperations {
  contractAddress?: string
  sender?: string
  receiver?: string
  askAsset?: string
  offerAsset?: string
  offerAmount?: string
  returnAmount?: string
}

export interface SwapAction {
  _contract_address: string,
  action: string[],
  denom_in: string,
  denom_out: string,
  msg_index: string
}

export interface PostSwapAction {
  _contract_address: string,
  action: string[],
  post_swap_action_amount_out: string,
  post_swap_action_denom_out: string,
  receiver: string,
  msg_index: string
}

export interface SwapAndAction {
  swapAction?: SwapAction,
  postSwapAction?: PostSwapAction
}

export interface OraiSwapAndActionResponse {
  operations: OraiSwapOperations[],
  postAction: SwapAndAction,
}

export interface EvmSwapData {
  evmMessage: any
}

export interface EvmSwapResponse {}

export interface SwapResponse {
  /**
   * Blockchain address of the balance.
   */
  fromAddress?: string
  /**
   * Blockchain address of the balance.
   */
  toAddress?: string
  inAsset: string
  inAmount: string
  outAsset: string
  outAmount: string
  minimumReceive?: string
  /**
   * Decimals of the asset. Valid for native and fungible tokens. For tokens, only when readable from the contract `decimals()` method.
   */
  decimals?: number
}


// export type SwapResponse = | EvmSwapResponse | OraiSwapOperations[];

