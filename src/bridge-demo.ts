import { toUtf8 } from '@cosmjs/encoding'
import { cosmwasm } from '@oraichain/proto'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
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
        contract: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
        msg: toUtf8(
          `
{
  "increase_allowance": {
    "amount": "1000000",
    "spender": "orai19r5wlt3ruc5xmkfvkwx5l3pul5h8kslexptyqyk5u6acue0ly9yqqpwmtp"
  }
}

                      `,
        ),
        funds: [],
      }).finish(),
    },
    {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.encode({
        sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
        contract: 'orai19r5wlt3ruc5xmkfvkwx5l3pul5h8kslexptyqyk5u6acue0ly9yqqpwmtp',
        msg: toUtf8(
          `
{
  "zap_in_liquidity": {
    "asset_in": {
      "amount": "1000000",
      "info": {
        "token": {
          "contract_addr": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh"
        }
      }
    },
    "minimum_liquidity": "206228865061367",
    "pool_key": {
      "token_x": "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h",
      "token_y": "orai",
      "fee_tier": {
        "fee": 3000000000,
        "tick_spacing": 100
      }
    },
    "routes": [
      {
        "offer_amount": "346668",
        "operations": [
          {
            "swap_v3": {
              "pool_key": {
                "token_x": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
                "token_y": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
                "fee_tier": {
                  "fee": 500000000,
                  "tick_spacing": 10
                }
              },
              "x_to_y": true
            }
          },
          {
            "swap_v3": {
              "pool_key": {
                "token_x": "orai",
                "token_y": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
                "fee_tier": {
                  "fee": 3000000000,
                  "tick_spacing": 100
                }
              },
              "x_to_y": false
            }
          },
          {
            "swap_v3": {
              "pool_key": {
                "token_x": "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h",
                "token_y": "orai",
                "fee_tier": {
                  "fee": 3000000000,
                  "tick_spacing": 100
                }
              },
              "x_to_y": false
            }
          }
        ],
        "token_in": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
        "minimum_receive": "57054486"
      },
      {
        "offer_amount": "653332",
        "operations": [
          {
            "swap_v3": {
              "pool_key": {
                "token_x": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
                "token_y": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
                "fee_tier": {
                  "fee": 500000000,
                  "tick_spacing": 10
                }
              },
              "x_to_y": true
            }
          },
          {
            "swap_v3": {
              "pool_key": {
                "token_x": "orai",
                "token_y": "orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd",
                "fee_tier": {
                  "fee": 3000000000,
                  "tick_spacing": 100
                }
              },
              "x_to_y": false
            }
          }
        ],
        "token_in": "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
        "minimum_receive": "203289"
      }
    ],
    "tick_lower_index": -63200,
    "tick_upper_index": -62500
  }
}

                      `,
        ),
        funds: [
          Coin.fromJSON({
            amount: '500000',
            denom: 'orai',
          }),
        ],
      }).finish(),
    },
    // {
    //   typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    //   value: MsgSend.encode({
    //     fromAddress: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
    //     toAddress: 'orai1rrlmvsaukfeg874fjsuxntsl22hw2j6u65hyng',
    //     amount: [
    //       {
    //         amount: '1867371174808',
    //         denom:
    //           'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraiUNrTQmeuc13JoMFSyNcJCnXYpqErfp9v5diy64b',
    //       },
    //     ],
    //   }).finish(),
    // },
    // {
    //   typeUrl: '/cosmwasm.tokenfactory.v1beta1.MsgCreateDenom',
    //   value: cosmwasm.tokenfactory.v1beta1.MsgCreateDenom.encode({
    //     sender: "orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh",
    //     subdenom: "huy"
    //   }).finish(),
    // },
  ]

  // const res = await tatumCosmos.simulate.simulate('orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w', msgs)

  console.log(Buffer.from(msgs[0].value).toString('base64'))
  console.log('split')
  console.log(Buffer.from(msgs[1].value).toString('base64'))

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
