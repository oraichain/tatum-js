export const MSG_TYPE = {
  COSMOS_MSG: 'cosmos',
  COSMWASM_MSG: 'cosmwasm',
  IBC_MSG: 'ibc',
}

export const WASM_MSG_TYPE = {
  EXECUTE_CONTRACT: 'MsgExecuteContract',
}

export const COSMWASM_TYPE = {
  WASM: 'wasm',
  TOKEN_FACTORY: 'tokenfactory',
}


export const COSMOS_TYPE = {
  BANK: 'bank',
}

export const COSMOS_BANK_MSG_TYPE = {
  MSG_SEND: 'MsgSend',
}

export const SWAP_EXECUTE_TYPE = {
  SWAP: 'swap',
  SWAP_AND_ACTION: 'swap_and_action',
  SWAP_OPERATIONS: 'execute_swap_operations',
  SEND: 'send',
}

export const BRIDGE_EXECUTE_TYPE = {
  TRANSFER_TO_REMOTE: 'transfer_to_remote',
  BRIDGE_TO_TON: 'bridge_to_ton',
  WITHDRAW_TO_BITCOIN: 'withdraw_to_bitcoin',
}

export const ORDERBOOK_EXECUTE_TYPE = {
  SUBMIT_ORDER: 'submit_order',
  SUBMIT_MARKET_ORDER: 'submit_market_order',
  CANCEL_ORDER: 'cancel_order',
}

export const CW20_EXECUTE_TYPE = {
  SEND: 'send',
  INCREASE_ALLOWANCE: 'increase_allowance',
}

export const POOL_EXECUTE_TYPE = {
  CREATE_DENOM: 'MsgCreateDenom',
}
