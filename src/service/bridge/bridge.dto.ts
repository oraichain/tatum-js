export interface CosmosTransferToRemoteData {
  txHash: string
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
