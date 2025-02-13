import { COSMWASM_MSG_TYPE } from '../../constant/msgType'

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

const handleParseCosmwasmExecuteContract = async (input: ParseInput) => {}

export default {
  parseCosmwasm,
}
