import httpStatus from 'http-status'

import { BRIDGE_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseBridgeContract = async ({ sender, messages, action }: ParseInput) => {
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
      response = await oraichainTatum.bridge.parseBtcBridge({
        message: msgs,
        events: simRes.data.result.events,
      })
      break
    default:
      break
  }

  return {
    action: {
      action: 'bridge',
      msgAction: action,
    },
    response,
  }
}
