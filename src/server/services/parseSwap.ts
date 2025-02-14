import httpStatus from 'http-status'

import { SWAP_EXECUTE_TYPE } from '../constant/msgType'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseSwapContract = async (
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
  if (simRes.error) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
  }

  if (!simRes.data.result) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
  }

  switch (action) {
    case SWAP_EXECUTE_TYPE.SWAP: {
      response = oraichainTatum.ammV2.parseSwap({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SWAP_AND_ACTION: {
      response = oraichainTatum.ammV2.parseSwapAndAction({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SEND: {
      response = oraichainTatum.ammV2.parseSend({
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
