import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import httpStatus from 'http-status'

import { ORAI_CONTRACT, ORAI_TOKEN_CONTRACTS } from '../../constant/contractAddress'
import { COSMOS_TYPE, COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { parseBank } from '../../services/parseBank'
import { parseBridgeContract } from '../../services/parseBridge'
import { parseCw20 } from '../../services/parseCw20'
import { parseFuturesContract } from '../../services/parseFutures'
import { parseSwapContract } from '../../services/parseSwap'
import { oraichainTatum } from '../../services/tatum'
import { ParseApiInput } from '../../types/parser'
import HttpException from '../../utils/exception'
import { parseStakingContract } from 'src/server/services/parseStaking'

const parseCosmwasm = async (input: ParseApiInput, msgType: string) => {
  let data

  switch (msgType) {
    case COSMWASM_MSG_TYPE.EXECUTE_CONTRACT:
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
      data = await parseStakingContract({sender: input.sender, messages: input.messages, action: action})
      break
    default:
      if (Object.values(ORAI_TOKEN_CONTRACTS).includes(contractAddress)) {
        data = await parseCw20({ sender: input.sender, messages: input.messages, action }, executeMsg)
      }
      break
  }

  return data
}

const parseCosmos = async (input: ParseApiInput, cosmosType: string, msgType: string) => {
  let data
  switch (cosmosType) {
    case COSMOS_TYPE.BANK:
      data = await parseBank(input, msgType)
      break
    default:
      break
  }

  return data
}

const parseIbc = async (input: ParseApiInput, msgType: string) => {
  const msgs = []

  for (const msg of input.messages) {
    msgs.push({
      typeUrl: msg.typeUrl,
      value: Uint8Array.from(Buffer.from(msg.value, 'base64')),
    })
  }

  const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
  if (simRes.error) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
  }

  if (!simRes.data.result) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
  }

  const response = await oraichainTatum.bridge.parseIbc({ message: msgs, events: simRes.data.result.events })

  return { action: msgType, response }
}

export default {
  parseCosmwasm,
  parseCosmos,
  parseIbc,
}
