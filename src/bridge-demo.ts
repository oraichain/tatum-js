import { toUtf8 } from '@cosmjs/encoding'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { MsgExecuteContract, MsgUpdateAdmin } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'

interface Message {
  [key: string]: any // Additional dynamic fields for each message
}

const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
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
      "native": {
        "amount": "80563958",
        "denom": "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h"
      }
    },
    "post_swap_action": {
      "transfer": {
        "to_address": "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w"
      }
    },
    "timeout_timestamp": 1739770398000000000,
    "user_swap": {
      "swap_exact_asset_in": {
        "swap_venue_name": "oraidex",
        "operations": [
          {
            "denom_in": "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/D7yP4ycfsRWUGYionGpi64sLF2ddZ2JXxuRAti2M7uck",
            "denom_out": "orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge",
            "pool": "orai1g6dcml7xwm8mcyav80yv94ds3ymn7f65pnerledtp7tj25jhcn2strhyc9"
          },
          {
            "denom_in": "orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge",
            "denom_out": "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h",
            "pool": "orai1s3746evfgwm7dtl3x4s7fmd37c4s8t566z0xvflr4shdculkxw5qa3pusc"
          }
        ]
      }
    }
  }
}`
          ),
          funds: [Coin.fromJSON({
            denom: "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/D7yP4ycfsRWUGYionGpi64sLF2ddZ2JXxuRAti2M7uck",
            amount: "554971449",
          })],
        }).finish(),
      } 
     ]

    const res = await tatumCosmos.simulate.simulate(
      "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
      msgs
    )

    console.log(Buffer.from(msgs[0].value).toString('base64'))

    const res1 = await tatumCosmos.ammV2.parseSwapAndAction({sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w", events: res.data.result!.events, message: msgs})
    const ms = MsgExecuteContract.decode(msgs[0].value)

    const val = (new TextDecoder).decode(ms.msg)
    const message = JSON.parse(val)
    // Get the name of the first element (first key)
    const action = Object.keys(message)[0]
    
    console.log(action)

    // console.log(res)
  // const data = await tatumCosmos.bridge.tokenInfo.getTokenInfo({ tokenId: 'orai' })

  // console.log('data: ', data)
}

main()
