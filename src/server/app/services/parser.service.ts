import { COSMWASM_EXECUTE_TYPE, COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { oraichainTatum } from '../../../server/services/tatum'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { COSMOS_NETWORKS } from 'src/dto'

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
  let res
  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const rawMsg = MsgExecuteContract.decode(value)
  const executeMsg = JSON.parse((new TextDecoder).decode(rawMsg.msg))
  const action = Object.keys(executeMsg)[0]
  console.log(action)
  const msgs = [
    {
      typeUrl: input.typeUrl,
      value: value,
    },
  ]

  switch(action) {
    case COSMWASM_EXECUTE_TYPE.SWAP: {
      const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
      res = await oraichainTatum.ammV2.parseSwap({sender: input.sender, events: simRes.data.result!.events, message: msgs})
      break
    }
    case COSMWASM_EXECUTE_TYPE.SWAP_AND_ACTION: {
      const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
      res = await oraichainTatum.ammV2.parseSwapAndAction({sender: input.sender, events: simRes.data.result!.events, message: msgs})
      break
    }
    default:
      break;
  }

  
  return res
}

export default {
  parseCosmwasm,
}
