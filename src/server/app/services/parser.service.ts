import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

import { ORAI_CONTRACT } from '../../constant/contractAddress'
import { COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { parseBridgeContract } from '../../services/parseBridge'
import { parseSwapContract } from '../../services/parseSwap'

export type ParseInput = {
  sender: string
  typeUrl: string
  value: string
}

const parseCosmwasm = async (input: ParseInput, msgType: string) => {
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

const handleParseCosmwasmExecuteContract = async (input: ParseInput): Promise<any> => {
  let data

  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const rawMsg = MsgExecuteContract.decode(value)
  const executeMsg = JSON.parse(new TextDecoder().decode(rawMsg.msg))
  const action = Object.keys(executeMsg)[0]
  const contractAddress = rawMsg.contract

  switch (contractAddress) {
    case ORAI_CONTRACT.SWAP: {
      data = await parseSwapContract(input.sender, input.typeUrl, value, action)
      break
    }
    case 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh': {
      data = await parseSwapContract(input.sender, input.typeUrl, value, action)
      break
    }
    case ORAI_CONTRACT.BRIDGE:
      data = await parseBridgeContract(input.sender, input.typeUrl, value, action)
      break
    default:
      break
  }

  return data
}

export default {
  parseCosmwasm,
}
