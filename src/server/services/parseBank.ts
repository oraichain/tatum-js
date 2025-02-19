import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import httpStatus from 'http-status'

import { SOLANA_BRIDGE_ADDRESS } from '../constant/contractAddress'
import { COSMOS_BANK_MSG_TYPE } from '../constant/msgType'
import { ParseApiInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseBank = async (input: ParseApiInput, msgType: string) => {
  let response
  let action: string = ''

  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const msgs = [
    {
      typeUrl: input.typeUrl,
      value,
    },
  ]

  const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
  if (simRes.error) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
  }
  if (!simRes.data.result) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
  }

  console.dir(simRes.data.result.events, { depth: null })

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

  return { action, response }
}
