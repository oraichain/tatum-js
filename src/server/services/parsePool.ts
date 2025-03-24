import httpStatus from 'http-status'

import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'
import { POOL_EXECUTE_TYPE } from '../constant/msgType'

export const parsePool = async ({ sender, messages, action }: ParseInput) => {
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
    case POOL_EXECUTE_TYPE.CREATE_DENOM:
      // TODO: Implement create denom parser
      break
    default:
      break
  }

  return {
    action: {
      action: 'pool',
      msgAction: action,
    },
    response,
  }
}