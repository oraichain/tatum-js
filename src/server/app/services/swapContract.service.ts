import { oraichainTatum } from '../../services/tatum'

const swap = async (sender: string, typeUrl: string, value: string) => {
    console.log(sender, typeUrl, value)

  const v = Uint8Array.from(Buffer.from(value, 'base64'))
  const msgs = [
    {
      typeUrl: typeUrl,
      value: v,
    },
  ]
  const res = await oraichainTatum.simulate.simulate(sender, msgs)
  console.log(res.result?.events)
  return
}

export default {
  swap,
}
