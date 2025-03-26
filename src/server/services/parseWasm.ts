import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

import { Status } from '../../util'
import { ORAI_CONTRACT, ORAI_TOKEN_CONTRACTS } from '../constant/contractAddress'
import { WASM_MSG_TYPE } from '../constant/msgType'
import { ParseApiInput } from '../types/parser'
import { parseBridgeContract } from './parseBridge'
import { parseCw20 } from './parseCw20'
import { parseFuturesContract } from './parseFutures'
import { parseOrderbookContract } from './parseOrderbook'
import { parsePool } from './parsePool'
import { parseStakingContract } from './parseStaking'
import { parseSwapContract } from './parseSwap'

export const parseWasm = async (input: ParseApiInput, msgType: string) => {
  let data

  switch (msgType) {
    case WASM_MSG_TYPE.EXECUTE_CONTRACT:
      data = await handleParseCosmwasmExecuteContract(input)
      break
    default:
      break
  }

  return data
}

const handleParseCosmwasmExecuteContract = async (input: ParseApiInput): Promise<any> => {
  let data

  const value = Uint8Array.from(Buffer.from(input.messages[0].value, 'base64'))
  const rawMsg = MsgExecuteContract.decode(value)
  const executeMsg = JSON.parse(new TextDecoder().decode(rawMsg.msg))
  const action = Object.keys(executeMsg)[0]
  const contractAddress = rawMsg.contract

  switch (contractAddress) {
    case ORAI_CONTRACT.SWAP:
    case ORAI_CONTRACT.SWAP_AND_ACTION:
    case ORAI_CONTRACT.SWAP_OPERATIONS:
      data = await parseSwapContract({
        sender: input.sender,
        messages: input.messages,
        action: action,
      })
      break
    case ORAI_CONTRACT.EVM_BRIDGE:
    case ORAI_CONTRACT.TON_BRIDGE:
    case ORAI_CONTRACT.BITCOIN_BRIDGE:
      data = await parseBridgeContract({ sender: input.sender, messages: input.messages, action: action })
      break
    case ORAI_CONTRACT.FUTURES:
      data = await parseFuturesContract({
        sender: input.sender,
        messages: input.messages,
        action: action,
      })
      break
    case ORAI_CONTRACT.STAKING:
      data = await parseStakingContract({ sender: input.sender, messages: input.messages, action: action })
      break
    case ORAI_CONTRACT.ORDERBOOK:
      data = await parseOrderbookContract({ sender: input.sender, messages: input.messages, action: action })
      break
    case ORAI_CONTRACT.POOL_V2:
    case ORAI_CONTRACT.POOL_V3:
      data = await parsePool({ sender: input.sender, messages: input.messages, action: action })
      break
    default:
      if (Object.values(ORAI_TOKEN_CONTRACTS).includes(contractAddress)) {
        data = await parseCw20({ sender: input.sender, messages: input.messages, action }, executeMsg)
        break
      }

      // catch parse add liquidity v2 msg here
      data = await parsePool({ sender: input.sender, messages: input.messages, action })
      if (data.response && data.response.status === Status.SUCCESS) {
        break
      }

      // catch parse withdraw liquidity v2 msg here
      data = await parseCw20({ sender: input.sender, messages: input.messages, action }, executeMsg)
      if (data.response && data.response.status === Status.SUCCESS) {
        break
      }

      break
  }

  return data
}
