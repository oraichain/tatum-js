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
    // {
    //   typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    //   value: MsgTransfer.encode({
    //     memo: ``,
    //     receiver: 'inj1vg6acwuuydxs4kza50lr2asnqntuvhyk7zva4w',
    //     sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
    //     sourceChannel: 'channel-146',
    //     sourcePort: 'transfer',
    //     timeoutHeight: {
    //       revisionHeight: BigInt('2739967232000000000'),
    //       revisionNumber: BigInt('2739967232000000000'),
    //     },
    //     timeoutTimestamp: BigInt('2739967232000000000'),
    //     token: {
    //       amount: '4146499000000000000',
    //       denom: 'ibc/49D820DFDE9F885D7081725A58202ABA2F465CAEE4AFBC683DFB79A8E013E83E',
    //     },
    //   }).finish(),
    // },
    // {
    //   typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    //   value: MsgExecuteContract.encode({
    //     sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
    //     contract: 'orai1g90x3z2kss99wvmpkenjdelmpw4hf9l3yt420gpgqvpuz8lt79uq24arlv',
    //     msg: toUtf8(
    //       `
    // {
    //   "withdraw_to_bitcoin": {
    //     "btc_address": "bc1ql4g33h25w5gg5wgvet9pvu6lvzsncsv0mpanxz",
    //     "fee": 51192000000
    //   }
    // }
    //           `,
    //     ),
    //     funds: [
    //       Coin.fromJSON({
    //         denom: 'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc',
    //         amount: '70100000000',
    //       }),
    //     ],
    //   }).finish(),
    // },
    {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: MsgSend.encode({
        fromAddress: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
        toAddress: 'orai1rrlmvsaukfeg874fjsuxntsl22hw2j6u65hyng',
        amount: [
          {
            amount: '1867371174808',
            denom:
              'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraiUNrTQmeuc13JoMFSyNcJCnXYpqErfp9v5diy64b',
          },
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
