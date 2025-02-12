import { CosmosRosetta, TatumSDK, Network } from "../../../service"

const swap = async (sender: string, typeUrl: string, value: string) => {
  console.log(sender, typeUrl, value)

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({network: Network.COSMOS_ROSETTA})
  await tatumCosmos.simulate.setupQueryClient("https://rpc.orai.io")
  const v = Uint8Array.from(Buffer.from(value, 'base64'))
  const msgs = [
    {
      typeUrl: typeUrl,
      value: v
    }
  ]
  const res = await tatumCosmos.simulate.simulate(sender, msgs)
  console.log(res.result?.events)
  return
}

export default {
  swap,
}
