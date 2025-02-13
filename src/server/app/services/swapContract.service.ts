import { SwapResponse } from '../../../service/amm-v2'
import { oraichainTatum } from '../../services/tatum'

const swap = async (sender: string, typeUrl: string, value: string): Promise<SwapResponse> => {
  console.log(sender, typeUrl, value)

  const v = Uint8Array.from(Buffer.from(value, 'base64'))
  const msgs = [
    {
      typeUrl: typeUrl,
      value: v,
    },
  ]
  const res = await oraichainTatum.simulate.simulate(sender, msgs)

  const parserRes = await oraichainTatum.ammV2.parseSwapAndAction({sender: sender, events: res.data.result!.events, message: msgs})
  
  return parserRes
}

export default {
  swap,
}
