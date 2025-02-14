import { toUtf8 } from '@cosmjs/encoding';
import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'
import { MsgUpdateAdmin, MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';


interface Message {
  [key: string]: any;  // Additional dynamic fields for each message
}

const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  await tatumCosmos.simulate.setupQueryClient("https://rpc.orai.io")

  const msgs = [
      {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.encode({
          sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
          contract: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
          msg: toUtf8(
            `{
  "send": {
    "contract": "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
    "amount": "479325",
    "msg": "eyJzd2FwX2FuZF9hY3Rpb24iOnsiYWZmaWxpYXRlcyI6W10sIm1pbl9hc3NldCI6eyJuYXRpdmUiOnsiYW1vdW50IjoiMTI2MDQ2IiwiZGVub20iOiJvcmFpIn19LCJwb3N0X3N3YXBfYWN0aW9uIjp7InRyYW5zZmVyIjp7InRvX2FkZHJlc3MiOiJvcmFpMXFwdXVuZHB2dHltY3lxM2NtY3R5M3VkZjJ6eTBtNTA5dzRrZzh3In19LCJ0aW1lb3V0X3RpbWVzdGFtcCI6MTczOTUwNDM2NzAwMDAwMDAwMCwidXNlcl9zd2FwIjp7InN3YXBfZXhhY3RfYXNzZXRfaW4iOnsic3dhcF92ZW51ZV9uYW1lIjoib3JhaWRleCIsIm9wZXJhdGlvbnMiOlt7ImRlbm9tX2luIjoib3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaCIsImRlbm9tX291dCI6Im9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UiLCJwb29sIjoib3JhaTEyaHpqeGZoNzd3bDU3MmdkemN0MmZ4djJhcnhjd2g2Z3lrYzdxaC1vcmFpMWx1czBmMHJoeDhzMDNnZGxseDJuNnZoa21mMDUzNmR2NTd3ZmdlLTMwMDAwMDAwMDAtMTAwIn0seyJkZW5vbV9pbiI6Im9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UiLCJkZW5vbV9vdXQiOiJvcmFpIiwicG9vbCI6Im9yYWkxbTZxNWs1bnIyZWg4cTByZHJmNTd3cjdwaGs3dXZscGc3bXdmdjUifV19fX19"
  }
}`
          ),
          funds: [Coin.fromJSON({
            denom: "orai",
            amount: "100000",
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
}

main()
