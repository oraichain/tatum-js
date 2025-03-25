import httpStatus from 'http-status'

import { POOL_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

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
      response = await oraichainTatum.pool.parseCreateDenom({
        message: msgs,
        events: simRes.data.result!.events,
      })
      break
    case POOL_EXECUTE_TYPE.CREATE_POOL_V2:
      response = await oraichainTatum.pool.parseCreatePoolV2({
        message: msgs,
        events: simRes.data.result!.events,
      })
      break
    case POOL_EXECUTE_TYPE.ADD_LIQUIDITY_V2:
      response = await oraichainTatum.pool.parseAddLiquidityV2({
        message: msgs,
        events: simRes.data.result!.events,
      })
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
