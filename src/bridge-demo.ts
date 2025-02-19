import { toUtf8 } from '@cosmjs/encoding'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'

interface Message {
  [key: string]: any // Additional dynamic fields for each message
}

const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  const msgs = [
    {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: MsgTransfer.encode({
        memo: `{\"wasm\":{\"contract\":\"osmo1h3jkejkcpthl45xrrm5geed3eq75p5rgfce9taufkwfr89k63muqweu2y7\",\"msg\":{\"swap_and_action\":{\"user_swap\":{\"swap_exact_asset_in\":{\"swap_venue_name\":\"osmosis-poolmanager\",\"operations\":[{\"pool\":\"2161\",\"denom_in\":\"ibc/905889A7F0B94F1CE1506D9BADF13AE9141E4CBDBCD565E1DFC7AE418B3E3E98\",\"denom_out\":\"factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON\"}]}},\"min_asset\":{\"native\":{\"denom\":\"factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON\",\"amount\":\"0\"}},\"timeout_timestamp\":1739967232000000000,\"post_swap_action\":{\"transfer\":{\"to_address\":\"osmo1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xmvj9wk\"}},\"affiliates\":[]}}}}`,
        receiver: 'osmo1h3jkejkcpthl45xrrm5geed3eq75p5rgfce9taufkwfr89k63muqweu2y7',
        sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
        sourceChannel: 'channel-13',
        sourcePort: 'transfer',
        timeoutHeight: {
          revisionHeight: BigInt('1739967232000000000'),
          revisionNumber: BigInt('1739967232000000000'),
        },
        timeoutTimestamp: BigInt('1739967232000000000'),
        token: {
          amount: '1091687000',
          denom: 'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton',
        },
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
