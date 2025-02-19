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
        contract: 'orai1c7tpjenafvgjtgm9aqwm7afnke6c56hpdms8jc6md40xs3ugd0es5encn0',
        msg: toUtf8(
          `
{
  "send": {
    "contract": "orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm",
    "amount": "32530468",
    "msg": "eyJsb2NhbF9jaGFubmVsX2lkIjoiY2hhbm5lbC0yOSIsInJlbW90ZV9hZGRyZXNzIjoib3JhaWIxZWc5dnQ4YWY4bmRlOGx4NGZsbXJrN3g5dXZqOHpkOHhoOW42ZzUiLCJyZW1vdGVfZGVub20iOiJ0cm9udHJ4LW1haW5uZXQweDg5MWNkYjkxZDE0OWYyM0IxYTQ1RDljNUNhNzhhODhkMGNCNDRDMTgiLCJ0aW1lb3V0IjoxNzM5OTM5MTY0MDAwMDAwMDAwLCJtZW1vIjoidHJvbnRyeC1tYWlubmV0MHhmYmM0ODc4OWVlOWIxNWMwNTllMDY4MDVhY2I0NjRmODE3Y2Y1NmMxIn0="
  }
}


  `,
        ),
        funds: [
          Coin.fromJSON({
            denom: 'orai',
            amount: '100000',
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
