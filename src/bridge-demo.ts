import { toUtf8 } from '@cosmjs/encoding'
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
            sender: 'orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w',
            contract: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
            msg: toUtf8(
              `
    {
  "send": {
    "contract": "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
    "amount": "1903435",
    "msg": "eyJzd2FwX2FuZF9hY3Rpb24iOnsiYWZmaWxpYXRlcyI6W10sIm1pbl9hc3NldCI6eyJjdzIwIjp7ImFtb3VudCI6IjE4OTM3MTMiLCJhZGRyZXNzIjoib3JhaTE1dW44bXN4M241emY5YWhseG1mZXFkMmt3YTV3bTBucnB4ZXIzMDRtOW5kNXE2cXEwZzZza3U1cGRkIn19LCJwb3N0X3N3YXBfYWN0aW9uIjp7InRyYW5zZmVyIjp7InRvX2FkZHJlc3MiOiJvcmFpMXFwdXVuZHB2dHltY3lxM2NtY3R5M3VkZjJ6eTBtNTA5dzRrZzh3In19LCJ0aW1lb3V0X3RpbWVzdGFtcCI6MTc0MDU0NDk1NjAwMDAwMDAwMCwidXNlcl9zd2FwIjp7InN3YXBfZXhhY3RfYXNzZXRfaW4iOnsic3dhcF92ZW51ZV9uYW1lIjoib3JhaWRleCIsIm9wZXJhdGlvbnMiOlt7ImRlbm9tX2luIjoib3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaCIsImRlbm9tX291dCI6Im9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UiLCJwb29sIjoib3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaC1vcmFpMWx1czBmMHJoeDhzMDNnZGxseDJuNnZoa21mMDUzNmR2NTd3ZmdlLTMwMDAwMDAwMDAtMTAwIn0seyJkZW5vbV9pbiI6Im9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UiLCJkZW5vbV9vdXQiOiJvcmFpMTV1bjhtc3gzbjV6ZjlhaGx4bWZlcWQya3dhNXdtMG5ycHhlcjMwNG05bmQ1cTZxcTBnNnNrdTVwZGQiLCJwb29sIjoib3JhaTE1dW44bXN4M241emY5YWhseG1mZXFkMmt3YTV3bTBucnB4ZXIzMDRtOW5kNXE2cXEwZzZza3U1cGRkLW9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UtMzAwMDAwMDAwMC0xMDAifV19fX19"
  }
}
                  `,
            ),
            funds: [
              Coin.fromJSON({
                denom: 'orai',
                amount: '1000',
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
