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
    //     receiver: 'neutaro1lwuqpj9teef8j0rjy2l4c5ay9yddw26ma9cd2d',
    //     sender: 'orai1lwuqpj9teef8j0rjy2l4c5ay9yddw26m03tlem',
    //     sourceChannel: 'channel-189',
    //     sourcePort: 'transfer',
    //     timeoutHeight: {
    //       revisionHeight: BigInt('2739967232000000000'),
    //       revisionNumber: BigInt('2739967232000000000'),
    //     },
    //     timeoutTimestamp: BigInt('2739967232000000000'),
    //     token: {
    //       amount: '123568055',
    //       denom: 'ibc/576B1D63E401B6A9A071C78A1D1316D016EC9333D2FEB14AD503FAC4B8731CD1',
    //     },
    //   }).finish(),
    // },
    {
      typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: MsgExecuteContract.encode({
        sender: 'orai1eg9vt8af8nde8lx4flmrk7x9uvj8zd8xqyhkeh',
        contract: 'orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e',
        msg: toUtf8(
          `
{
  "bridge_to_ton": {
    "denom": "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    "timeout": 1740048782,
    "to": "UQCjmNkKQrVx_nMiRoJr39GJpo7onNm09GqpUxEer-BnJzvv"
  }
}

          
          `,
        ),
        funds: [
          Coin.fromJSON({
            denom: 'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton',
            amount: '3000000000',
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
