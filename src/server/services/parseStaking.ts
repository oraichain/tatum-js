
import { ParseInput } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'
import httpStatus from 'http-status'

export const parseStakingContract = async({sender, messages, action}: ParseInput) => {
  let response
  const msgs = []

  for(const msg of messages) {
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

  response = await oraichainTatum.staking.parseStakingAction({
    sender: sender,
    message: msgs,
    events: simRes.data.result!.events
  })

  return {
    action: {
      action: 'staking',
      msgAction: action,
    },
    response,
  }
}