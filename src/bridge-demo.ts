import { toUtf8 } from '@cosmjs/encoding';
import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'
import { MsgUpdateAdmin, MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';


interface Message {
  [key: string]: any;  // Additional dynamic fields for each message
}

const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  await tatumCosmos.simulate.setupQueryClient("https://rpc.orai.io")

  const msgs = [
      {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.encode({
          sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
          contract: "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
          msg: toUtf8(
            `{
  "swap_and_action": {
    "affiliates": [],
    "min_asset": {
      "cw20": {
        "amount": "394980",
        "address": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh"
      }
    },
    "post_swap_action": {
      "transfer": {
        "to_address": "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w"
      }
    },
    "timeout_timestamp": 1739560318000000000,
    "user_swap": {
      "swap_exact_asset_in": {
        "swap_venue_name": "oraidex",
        "operations": [
          {
            "denom_in": "orai",
            "denom_out": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
            "pool": "orai-orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd-3000000000-100"
          },
          {
            "denom_in": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
            "denom_out": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
            "pool": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd-500000000-10"
          }
        ]
      }
    }
  }
}`
          ),
          funds: [Coin.fromJSON({
            denom: "orai",
            amount: "100000",
          })],
        }).finish(),
      } 
     ]

    const res = await tatumCosmos.simulate.simulate(
      "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
      msgs
    )

    // console.log(Buffer.from(msgs[0].value).toString('base64'))

    const res1 = await tatumCosmos.ammV2.parseSwapAndAction({sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w", events: res.data.result!.events, message: msgs})
    const ms = MsgExecuteContract.decode(msgs[0].value)

    const val = (new TextDecoder).decode(ms.msg)
    const message = JSON.parse(val)
    // Get the name of the first element (first key)
    const action = Object.keys(message)[0]
    
    console.log(action)

    // console.log(res)
}

main()
