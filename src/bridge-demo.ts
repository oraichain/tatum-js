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
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.encode({
        sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
        contract: 'orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0',
        msg: toUtf8(
          `
{
  "swap_and_action": {
    "affiliates": [],
    "min_asset": {
      "cw20": {
        "amount": "1585894",
        "address": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh"
      }
    },
    "post_swap_action": {
      "transfer": {
        "to_address": "orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh"
      }
    },
    "timeout_timestamp": 1739791126000000000,
    "user_swap": {
      "swap_exact_asset_in": {
        "swap_venue_name": "oraidex",
        "operations": [
          {
            "denom_in": "orai",
            "denom_out": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
            "pool": "orai-orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-3000000000-100"
          }
        ]
      }
    }
  }
}


`,
        ),
        funds: [
          Coin.fromJSON({
            denom: 'orai',
            amount: '351749',
          }),
        ],
      }).finish(),
    },
  ]

  // const res = await tatumCosmos.simulate.simulate('orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w', msgs)

  console.log(Buffer.from(msgs[0].value).toString('base64'))

  // const res1 = await tatumCosmos.ammV2.parseSwapAndAction({
  //   sender: 'orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w',
  //   events: res.data.result!.events,
  //   message: msgs,
  // })
  // const ms = MsgExecuteContract.decode(msgs[0].value)

  // const val = new TextDecoder().decode(ms.msg)
  // const message = JSON.parse(val)
  // // Get the name of the first element (first key)
  // const action = Object.keys(message)[0]

  // console.log(action)

  // console.log(res)
  // const data = await tatumCosmos.bridge.tokenInfo.getTokenInfo({ tokenId: 'orai' })

  // console.log('data: ', data)
}

main()
