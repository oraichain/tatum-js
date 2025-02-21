import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'

import { SOLANA_BRIDGE_ADDRESS } from '../constant/contractAddress'
import { COSMOS_BANK_MSG_TYPE } from '../constant/msgType'
import { ParseApiInput } from '../types/parser'
import { oraichainTatum } from './tatum'

export const parseBank = async (input: ParseApiInput, msgType: string) => {
  let response
  let action = {} as any

  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const msgs = [
    {
      typeUrl: input.typeUrl,
      value,
    },
  ]

  switch (msgType) {
    case COSMOS_BANK_MSG_TYPE.MSG_SEND:
      const rawMsg = MsgSend.decode(value)
      action.msgAction = COSMOS_BANK_MSG_TYPE.MSG_SEND

      if (rawMsg.toAddress === SOLANA_BRIDGE_ADDRESS) {
        action.action = 'bridge'
        response = await oraichainTatum.bridge.parseSolana({
          message: msgs,
          events: [],
        })
      }

      break
    default:
      break
  }

  return { action, response }
}
