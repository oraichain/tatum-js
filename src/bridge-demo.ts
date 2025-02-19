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
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.encode({
          sender: "orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w",
          contract: "orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh",
          msg: toUtf8(
            `{
  "send": {
    "contract": "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
    "amount": "900000",
    "msg": "eyJzd2FwX2FuZF9hY3Rpb24iOnsiYWZmaWxpYXRlcyI6W10sIm1pbl9hc3NldCI6eyJuYXRpdmUiOnsiYW1vdW50IjoiODU5MjI0MTkiLCJkZW5vbSI6ImZhY3Rvcnkvb3JhaTF3dXZoZXg5eHFzM3I1MzltdmM2bXRtN24yMGZjajNxcjJtMHk5a2h4Nm41dnRsbmdmemVzM2swcnE5L29yYWltOGM5ZDFua2Z1UWs5RXpHWUVVR3hxTDNNSFFZbmRSdzFodVZvNWgifX0sInBvc3Rfc3dhcF9hY3Rpb24iOnsidHJhbnNmZXIiOnsidG9fYWRkcmVzcyI6Im9yYWkxcXB1dW5kcHZ0eW1jeXEzY21jdHkzdWRmMnp5MG01MDl3NGtnOHcifX0sInRpbWVvdXRfdGltZXN0YW1wIjoxNzM5ODgwNTMyMDAwMDAwMDAwLCJ1c2VyX3N3YXAiOnsic3dhcF9leGFjdF9hc3NldF9pbiI6eyJzd2FwX3ZlbnVlX25hbWUiOiJvcmFpZGV4Iiwib3BlcmF0aW9ucyI6W3siZGVub21faW4iOiJvcmFpMTJoemp4Zmg3N3dsNTcyZ2R6Y3QyZnh2MmFyeGN3aDZneWtjN3FoIiwiZGVub21fb3V0Ijoib3JhaSIsInBvb2wiOiJvcmFpMWM1czAzYzNsMzM2ZGdlc25lN2R5bG5taHN6dzg1NTR0c3l5OXl0In0seyJkZW5vbV9pbiI6Im9yYWkiLCJkZW5vbV9vdXQiOiJmYWN0b3J5L29yYWkxd3V2aGV4OXhxczNyNTM5bXZjNm10bTduMjBmY2ozcXIybTB5OWtoeDZuNXZ0bG5nZnplczNrMHJxOS9vcmFpbThjOWQxbmtmdVFrOUV6R1lFVUd4cUwzTUhRWW5kUncxaHVWbzVoIiwicG9vbCI6Im9yYWkxemgzYThsZXdhZjdwcTdqY3dmNzIwdWpsdmt6eGZ3MnYzcHZocW55Y3J4anRrZjh3NmFtc3NzbWV6MCJ9XX19fX0="
  }
}`
          ),
          funds: [],
        }).finish(),
      } 
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
