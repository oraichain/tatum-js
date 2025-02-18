import { Event } from '@cosmjs/stargate'
import httpStatus from 'http-status'

import { ORAI_CONTRACT } from '../constant/contractAddress'
import { USDT_CW20_EXECUTE_TYPE } from '../constant/msgType'
import { ParseInput, SimulateMsg } from '../types/parser'
import HttpException from '../utils/exception'
import { oraichainTatum } from './tatum'

export const parseCw20 = async ({ sender, typeUrl, value, action }: ParseInput, executeMsg: any) => {
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
      response = await handleParseSend(sender, executeMsg.send.contract, msgs, simRes.data.result.events)
      break
    case USDT_CW20_EXECUTE_TYPE.INCREASE_ALLOWANCE:
      response = await handleParseIncreaseAllowance(sender, executeMsg.spender, msgs, simRes.data.result.events)
      break
    default:
      break
  }

  return { action, response }
}

const handleParseSend = async (sender: string, contract: string, message: SimulateMsg[], events: Event[]) => {
  let response

  switch (contract) {
    case ORAI_CONTRACT.BRIDGE:
      response = await oraichainTatum.bridge.parseTransferToRemote({
        message,
        events,
      })
      break
    case ORAI_CONTRACT.SWAP: 
    case ORAI_CONTRACT.SWAP_AND_ACTION:
    case ORAI_CONTRACT.SWAP_OPERATIONS:
      response = await oraichainTatum.ammV2.parseSend({ message, events, sender })
      break
    default:
      break
    }

  return response
}

const handleParseIncreaseAllowance = async(sender: string, contract: string, message: SimulateMsg[], events: Event[]) => {
  let response
}
