import httpStatus from 'http-status'

import { COSMOS_TYPE, COSMWASM_TYPE } from '../../constant/msgType'
import { oraichainTatum } from '../../services/tatum'
import { ParseApiInput } from '../../types/parser'
import HttpException from '../../utils/exception'
import { parseWasm } from '../../../server/services/parseWasm'
import { parseBank } from '../../../server/services/parseBank'
import { parsePool } from '../../../server/services/parsePool'

const parseCosmwasm = async (input: ParseApiInput, cosmwasmType: string, msgType: string) => {
  let data

  switch (cosmwasmType) {
    case COSMWASM_TYPE.WASM:
      data = await parseWasm(input, msgType)
      break
    case COSMWASM_TYPE.TOKEN_FACTORY:
      data = await parsePool({ sender: input.sender, messages: input.messages, action: msgType })
      break
    default:
      break
  }

  return data
}

const parseCosmos = async (input: ParseApiInput, cosmosType: string, msgType: string) => {
  let data
  switch (cosmosType) {
    case COSMOS_TYPE.BANK:
      data = await parseBank(input, msgType)
      break
    default:
      break
  }

  return data
}

const parseIbc = async (input: ParseApiInput, msgType: string) => {
  const msgs = []

  for (const msg of input.messages) {
    msgs.push({
      typeUrl: msg.typeUrl,
      value: Uint8Array.from(Buffer.from(msg.value, 'base64')),
    })
  }

  const simRes = await oraichainTatum.simulate.simulate(input.sender, msgs)
  if (simRes.error) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, simRes.error.message as any)
  }

  if (!simRes.data.result) {
    throw new HttpException(httpStatus.SERVICE_UNAVAILABLE, 'Simulate with undefined result')
  }

  const response = await oraichainTatum.bridge.parseIbc({ message: msgs, events: simRes.data.result.events })

  return {
    action: {
      action: 'bridge',
      msgAction: msgType,
    },
    response,
  }
}

export default {
  parseCosmwasm,
  parseCosmos,
  parseIbc,
}
