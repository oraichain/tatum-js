import httpStatus from 'http-status'

import { SWAP_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseSwapContract = async ({ sender, messages, action }: ParseInput) => {
  let response
  const msgs = []

  for (const msg of messages) {
    msgs.push({
      typeUrl: msg.typeUrl,
      value: Uint8Array.from(Buffer.from(msg.value, 'base64')),
    })
  }

  const simRes = await oraichainTatum.simulate.simulate(sender, msgs)
  if (simRes.error) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
  }

  if (!simRes.data.result) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
  }

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
    case SWAP_EXECUTE_TYPE.SWAP_OPERATIONS: {
      response = await oraichainTatum.ammV2.parserSwapOperations({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SEND: {
      response = await oraichainTatum.ammV2.parseSend({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    default:
      break
  }

  return {
    action: {
      action: 'swap',
      msgAction: action,
    },
    response,
  }
}
