import { Event } from '@cosmjs/stargate'
import httpStatus from 'http-status'

import { ORAI_CONTRACT } from '../constant/contractAddress'
import { USDT_CW20_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput, SimulateMsg } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseUsdtCw20 = async ({ sender, typeUrl, value, action }: ParseInput, sendContract: string) => {
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
    case USDT_CW20_EXECUTE_TYPE.SEND:
      response = await handleParseSend(sendContract, msgs, simRes.data.result.events)
      break
    default:
      break
  }

  return { action, response }
}

const handleParseSend = async (contract: string, message: SimulateMsg[], events: Event[]) => {
  let response

  switch (contract) {
    case ORAI_CONTRACT.BRIDGE:
      response = await oraichainTatum.bridge.parseTransferToRemote({
        message,
        events,
      })
      break
    default:
      break
  }

  return response
}
