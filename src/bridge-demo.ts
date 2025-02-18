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
        sender: 'orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w',
        contract: 'orai15un8msx3n5zf9ahlxmfeqd2kwa5wm0nrpxer304m9nd5q6qq0g6sku5pdd',
        msg: toUtf8(
          `{
  "send": {
    "contract": "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
    "amount": "676560",
    "msg": "eyJzd2FwX2FuZF9hY3Rpb24iOnsiYWZmaWxpYXRlcyI6W10sIm1pbl9hc3NldCI6eyJjdzIwIjp7ImFtb3VudCI6IjQ3NjU0IiwiYWRkcmVzcyI6Im9yYWkxOXJ0bWtrNnNuNHRwcHZqbXA1ZDV6ajZnZnNkeWtybDVydzJldXU1Z3d1cjNsdWhldXV1c2VzcW40OSJ9fSwicG9zdF9zd2FwX2FjdGlvbiI6eyJ0cmFuc2ZlciI6eyJ0b19hZGRyZXNzIjoib3JhaTFxcHV1bmRwdnR5bWN5cTNjbWN0eTN1ZGYyenkwbTUwOXc0a2c4dyJ9fSwidGltZW91dF90aW1lc3RhbXAiOjE3Mzk4NjYzNzEwMDAwMDAwMDAsInVzZXJfc3dhcCI6eyJzd2FwX2V4YWN0X2Fzc2V0X2luIjp7InN3YXBfdmVudWVfbmFtZSI6Im9yYWlkZXgiLCJvcGVyYXRpb25zIjpbeyJkZW5vbV9pbiI6Im9yYWkxNXVuOG1zeDNuNXpmOWFobHhtZmVxZDJrd2E1d20wbnJweGVyMzA0bTluZDVxNnFxMGc2c2t1NXBkZCIsImRlbm9tX291dCI6Im9yYWkxMmh6anhmaDc3d2w1NzJnZHpjdDJmeHYyYXJ4Y3doNmd5a2M3cWgiLCJwb29sIjoib3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaC1vcmFpMTV1bjhtc3gzbjV6ZjlhaGx4bWZlcWQya3dhNXdtMG5ycHhlcjMwNG05bmQ1cTZxcTBnNnNrdTVwZGQtNTAwMDAwMDAwLTEwIn0seyJkZW5vbV9pbiI6Im9yYWkxMmh6anhmaDc3d2w1NzJnZHpjdDJmeHYyYXJ4Y3doNmd5a2M3cWgiLCJkZW5vbV9vdXQiOiJvcmFpIiwicG9vbCI6Im9yYWktb3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaC0zMDAwMDAwMDAwLTEwMCJ9LHsiZGVub21faW4iOiJvcmFpIiwiZGVub21fb3V0Ijoib3JhaTE5cnRta2s2c240dHBwdmptcDVkNXpqNmdmc2R5a3JsNXJ3MmV1dTVnd3VyM2x1aGV1dXVzZXNxbjQ5IiwicG9vbCI6Im9yYWktb3JhaTE5cnRta2s2c240dHBwdmptcDVkNXpqNmdmc2R5a3JsNXJ3MmV1dTVnd3VyM2x1aGV1dXVzZXNxbjQ5LTMwMDAwMDAwMDAtMTAwIn1dfX19fQ=="
  }
}`,
        ),
        funds: [
          // Coin.fromJSON({
          //   denom: 'orai',
          //   amount: '1000',
          // }),
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
