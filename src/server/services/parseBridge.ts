import httpStatus from 'http-status'

import { BRIDGE_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseBridgeContract = async ({ sender, typeUrl, value, action }: ParseInput) => {
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
    case BRIDGE_EXECUTE_TYPE.TRANSFER_TO_REMOTE:
      response = await oraichainTatum.bridge.parseTransferToRemote({
        message: msgs,
        events: simRes.data.result.events,
      })
      break
    case BRIDGE_EXECUTE_TYPE.BRIDGE_TO_TON:
      response = await oraichainTatum.bridge.parseTonBridge({
        message: msgs,
        events: simRes.data.result.events,
      })
      break
    case BRIDGE_EXECUTE_TYPE.WITHDRAW_TO_BITCOIN:
      // TODO: need to handle parse bridge to btc here
      break
    default:
      break
  }

  return { action, response }
}
