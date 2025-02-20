import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { ORAI_CONTRACT, ORAI_TOKEN_CONTRACTS } from '../../constant/contractAddress'
import { COSMOS_TYPE, COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { parseBank } from '../../services/parseBank'
import { parseBridgeContract } from '../../services/parseBridge'
import { parseSwapContract } from '../../services/parseSwap'
import { parseCw20 } from '../../services/parseUsdtCw20'
import { ParseApiInput } from '../../types/parser'

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
  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const rawMsg = MsgExecuteContract.decode(value)
  const executeMsg = JSON.parse(new TextDecoder().decode(rawMsg.msg))
  const action = Object.keys(executeMsg)[0]
  const contractAddress = rawMsg.contract

  switch (contractAddress) {
    case ORAI_CONTRACT.SWAP:
    case ORAI_CONTRACT.SWAP_AND_ACTION:
    case ORAI_CONTRACT.SWAP_OPERATIONS:
      data = await parseSwapContract({ sender: input.sender, typeUrl: input.typeUrl, value, action })
      break
    case ORAI_CONTRACT.BRIDGE:
      data = await parseBridgeContract({ sender: input.sender, typeUrl: input.typeUrl, value, action })
      break
    case ORAI_CONTRACT.FUTURES:
      break
    case ORAI_CONTRACT.STAKING:
      break
    default:
      if (Object.values(ORAI_TOKEN_CONTRACTS).includes(contractAddress)) {
        data = await parseCw20(
          { sender: input.sender, typeUrl: input.typeUrl, value, action },
          executeMsg,
        ) 
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

export default {
  parseCosmwasm,
  parseCosmos,
}
