import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

import { ORAI_CONTRACT, ORAI_TOKEN_CONTRACTS, SOLANA_BRIDGE_ADDRESS } from '../../constant/contractAddress'
import { COSMOS_BANK_MSG_TYPE, COSMOS_TYPE, COSMWASM_MSG_TYPE } from '../../constant/msgType'
import { parseBridgeContract } from '../../services/parseBridge'
import { parseSwapContract } from '../../services/parseSwap'
import { parseCw20 } from '../../services/parseUsdtCw20'

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
    case ORAI_CONTRACT.SWAP_AND_ACTION:
    case ORAI_CONTRACT.SWAP_OPERATIONS:
      data = await parseSwapContract({ sender: input.sender, typeUrl: input.typeUrl, value, action })
      break
    case ORAI_CONTRACT.BRIDGE:
      data = await parseBridgeContract({ sender: input.sender, typeUrl: input.typeUrl, value, action })
      break
    default:
      if (Object.values(ORAI_TOKEN_CONTRACTS).includes(contractAddress)) {
        data = await parseCw20(
          { sender: input.sender, typeUrl: input.typeUrl, value, action },
          executeMsg.send.contract,
        )
      }
      break
  }

  return data
}

const parseCosmos = async (input: ParseInput, cosmosType: string, msgType: string) => {
  let data
  switch (cosmosType) {
    case COSMOS_TYPE.BANK:
      data = await handleParseBankMsg(input, msgType)
      break
    default:
      break
  }

  return data
}

const handleParseBankMsg = async (input: ParseInput, msgType: string) => {
  let data
  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))

  switch (msgType) {
    case COSMOS_BANK_MSG_TYPE.MSG_SEND:
      const rawMsg = MsgSend.decode(value)

      if (rawMsg.toAddress === SOLANA_BRIDGE_ADDRESS) {
        // TODO: handle parse bridge solana
      }

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
