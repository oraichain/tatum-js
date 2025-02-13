import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

import { oraichainTatum } from '../../../server/services/tatum'
import { ORAI_CONTRACT } from '../../constant/contractAddress'
import { COSMWASM_MSG_TYPE, SWAP_EXECUTE_TYPE } from '../../constant/msgType'

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
    case ORAI_CONTRACT.SWAP:
      data = await handleParseSwapContract(input.sender, input.typeUrl, value, action)
      break
    case ORAI_CONTRACT.BRIDGE:
      break
    default:
      break
  }

  return data
}

const handleParseSwapContract = async (
  sender: string,
  typeUrl: string,
  value: Uint8Array,
  action: string,
) => {
  let response

  const msgs = [
    {
      typeUrl,
      value,
    },
  ]
  const simRes = await oraichainTatum.simulate.simulate(sender, msgs)

  switch (action) {
    case SWAP_EXECUTE_TYPE.SWAP: {
      response = await oraichainTatum.ammV2.parseSwap({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SWAP_AND_ACTION: {
      response = await oraichainTatum.ammV2.parseSwapAndAction({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    default:
      break
  }
  return { action, response }
}

export default {
  parseCosmwasm,
}
