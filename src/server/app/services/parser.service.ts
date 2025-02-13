import { COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { oraichainTatum } from '../../../server/services/tatum'

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
  const v = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const msgs = [
    {
      typeUrl: input.typeUrl,
      value: v,
    },
  ]

  const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
  const parserRes = await oraichainTatum.ammV2.parseSwapAndAction({sender: input.sender, events: simRes.data.result!.events, message: msgs})
  return parserRes
}

export default {
  parseCosmwasm,
}
