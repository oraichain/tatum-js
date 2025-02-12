import { toUtf8 } from '@cosmjs/encoding';
import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'
import { MsgUpdateAdmin, MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";


const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  await tatumCosmos.simulate.setupQueryClient("https://rpc.orai.io")
    const res = await tatumCosmos.simulate.simulate(
      "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
      [
      {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.encode({
          sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
          contract: "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
          msg: toUtf8(
            JSON.stringify({
              increase_allowance: {
                amount: "100000000000000",
                spender:
                  "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a",
              },
            })
          ),
          funds: [],
        }).finish(),
      },
    ]
    )
  
    console.log(res)
}

main()
