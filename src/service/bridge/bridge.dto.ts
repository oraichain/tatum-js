export interface CosmosTransferToRemoteData {
  txHash: string
}

export interface EvmTransferToRemoteData {
  evmMessage: any
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
