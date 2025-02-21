import httpStatus from 'http-status'

import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseFuturesContract = async ({ sender, typeUrl, value, action }: ParseInput) => {
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

  response = oraichainTatum.futures.parseFuturesAction({
    sender: sender,
    message: msgs,
    events: simRes.data.result!.events,
  })

  return {
    action: {
      action: 'future',
      msgAction: action,
    },
    response,
  }
}
