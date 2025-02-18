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
        contract: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
        msg: toUtf8(
          `
{
  "send": {
    "contract": "orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm",
    "amount": "8060410",
    "msg": "eyJsb2NhbF9jaGFubmVsX2lkIjoiY2hhbm5lbC0yOSIsInJlbW90ZV9hZGRyZXNzIjoib3JhaWIxZWc5dnQ4YWY4bmRlOGx4NGZsbXJrN3g5dXZqOHpkOHhoOW42ZzUiLCJyZW1vdGVfZGVub20iOiJldGgtbWFpbm5ldDB4ZEFDMTdGOTU4RDJlZTUyM2EyMjA2MjA2OTk0NTk3QzEzRDgzMWVjNyIsInRpbWVvdXQiOjE3Mzk4Njk3NTkwMDAwMDAwMDAsIm1lbW8iOiJldGgtbWFpbm5ldDB4NjIzNWRjM2I5YzIzNGQwYWQ4NWRhM2ZlMzU3NjEzMDRkN2M2NWM5NiJ9"
  }
}


  `,
        ),
        funds: [
          Coin.fromJSON({
            denom: 'orai',
            amount: '10000',
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
