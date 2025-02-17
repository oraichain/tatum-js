export type ParseInput = {
  sender: string
  typeUrl: string
  value: Uint8Array
  action: string
}

export type SimulateMsg = {
  typeUrl: string
  value: Uint8Array
}
