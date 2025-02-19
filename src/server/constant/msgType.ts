export const MSG_TYPE = {
  COSMOS_MSG: 'cosmos',
  COSMWASM_MSG: 'cosmwasm',
  IBC_MSG: 'ibc',
}

export const COSMWASM_MSG_TYPE = {
  EXECUTE_CONTRACT: 'MsgExecuteContract',
}

export const COSMOS_TYPE = {
  BANK: 'bank',
}

export const COSMOS_BANK_MSG_TYPE = {
  MSG_SEND: "MsgSend"
}

export const SWAP_EXECUTE_TYPE = {
  SWAP: 'swap',
  SWAP_AND_ACTION: 'swap_and_action',
  SWAP_OPERATIONS: 'execute_swap_operations',
  SEND: 'send',
}

export const BRIDGE_EXECUTE_TYPE = {
  TRANSFER_TO_REMOTE: 'transfer_to_remote',
}

export const USDT_CW20_EXECUTE_TYPE = {
  SEND: 'send',
}
