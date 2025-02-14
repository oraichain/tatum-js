import httpStatus from 'http-status'

import { BRIDGE_EXECUTE_TYPE } from '../constant/msgType'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseBridgeContract = async (
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
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message.join(','))
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
    default:
      break
  }

  return { action, response }
}
