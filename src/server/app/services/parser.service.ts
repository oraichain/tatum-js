import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import {fromUtf8, fromBase64} from '@cosmjs/encoding'
import { COSMOS_NETWORKS } from 'src/dto'
import { oraichainTatum } from '../../../server/services/tatum'
import { ORAI_CONTRACT } from '../../constant/contractAddress'
import { COSMWASM_MSG_TYPE, SWAP_EXECUTE_TYPE } from '../../constant/msgType'

export type ParseInput = {
  sender: string
  typeUrl: string
  value: string
}

const parseCosmwasm = async (input: ParseInput, msgType: string) => {
  let data
  switch (msgType) {
    case COSMWASM_MSG_TYPE.EXECUTE_CONTRACT:
      data = await handleParseCosmwasmExecuteContract(input)
      break
    default:
      break
  }

  return data
}

const handleParseCosmwasmExecuteContract = async (input: ParseInput): Promise<any> => {
  let data

  const value = Uint8Array.from(Buffer.from(input.value, 'base64'))
  const rawMsg = MsgExecuteContract.decode(value)
  const executeMsg = JSON.parse(new TextDecoder().decode(rawMsg.msg))
  const action = Object.keys(executeMsg)[0]
  const contractAddress = rawMsg.contract

  switch (contractAddress) {
    case ORAI_CONTRACT.SWAP:
      data = await handleParseSwapContract(input.sender, input.typeUrl, value, action)
      break
    case ORAI_CONTRACT.BRIDGE:
      break
    default:
      break
  }

  return data
}

const handleParseSwapContract = async (
  sender: string,
  typeUrl: string,
  value: Uint8Array,
  action: string,
) => {
  let response
  const msgs = [
    {
      typeUrl,
      value,
    },
  ]
  const simRes = await oraichainTatum.simulate.simulate(sender, msgs)

  switch (action) {
    case SWAP_EXECUTE_TYPE.SWAP: {
      response = oraichainTatum.ammV2.parseSwap({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SWAP_AND_ACTION: {
      response = oraichainTatum.ammV2.parseSwapAndAction({
        sender: sender,
        events: simRes.data.result!.events,
        message: msgs,
      })
      break
    }
    case SWAP_EXECUTE_TYPE.SEND: {
      // const msg = Buffer.from(rawMsg.msg).toString('base64')
      // handleParseCosmwasmExecuteContract({sender: input.sender, typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: msg})
      // const res = decodeNestedObject(rawMsg)
      // console.log(res)
      // console.dir(res, {depth: null})
      // console.log(res.msg.send)
      break
    }
    default:
      break
  }
  return { action, response }
}

function decodeNestedObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(decodeNestedObject);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'msg') {
          if (obj[key] instanceof Uint8Array) {
            newObj[key] = decodeNestedObject(JSON.parse(fromUtf8(obj[key])));
          } else if (typeof obj[key] === 'string') {
            newObj[key] = decodeNestedObject(JSON.parse(fromUtf8(fromBase64(obj[key]))));
          } else {
            newObj[key] = decodeNestedObject(obj[key]); // Handle nested msg objects
          }
        } else {
          newObj[key] = decodeNestedObject(obj[key]);
          // console.log(newObj[key])
        }
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * 
 * {
  "send": {
    "contract": "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
    "amount": "199353",
    "msg": "eyJzd2FwX2FuZF9hY3Rpb24iOnsiYWZmaWxpYXRlcyI6W10sIm1pbl9hc3NldCI6eyJuYXRpdmUiOnsiYW1vdW50IjoiNDg1MTMiLCJkZW5vbSI6Im9yYWkifX0sInBvc3Rfc3dhcF9hY3Rpb24iOnsidHJhbnNmZXIiOnsidG9fYWRkcmVzcyI6Im9yYWkxcXB1dW5kcHZ0eW1jeXEzY21jdHkzdWRmMnp5MG01MDl3NGtnOHcifX0sInRpbWVvdXRfdGltZXN0YW1wIjoxNzM5NDM1NTc3MDAwMDAwMDAwLCJ1c2VyX3N3YXAiOnsic3dhcF9leGFjdF9hc3NldF9pbiI6eyJzd2FwX3ZlbnVlX25hbWUiOiJvcmFpZGV4Iiwib3BlcmF0aW9ucyI6W3siZGVub21faW4iOiJvcmFpMTJoemp4Zmg3N3dsNTcyZ2R6Y3QyZnh2MmFyeGN3aDZneWtjN3FoIiwiZGVub21fb3V0Ijoib3JhaTE1dW44bXN4M241emY5YWhseG1mZXFkMmt3YTV3bTBucnB4ZXIzMDRtOW5kNXE2cXEwZzZza3U1cGRkIiwicG9vbCI6Im9yYWkxMmh6anhmaDc3d2w1NzJnZHpjdDJmeHYyYXJ4Y3doNmd5a2M3cWgtb3JhaTE1dW44bXN4M241emY5YWhseG1mZXFkMmt3YTV3bTBucnB4ZXIzMDRtOW5kNXE2cXEwZzZza3U1cGRkLTUwMDAwMDAwMC0xMCJ9LHsiZGVub21faW4iOiJvcmFpMTV1bjhtc3gzbjV6ZjlhaGx4bWZlcWQya3dhNXdtMG5ycHhlcjMwNG05bmQ1cTZxcTBnNnNrdTVwZGQiLCJkZW5vbV9vdXQiOiJvcmFpMWx1czBmMHJoeDhzMDNnZGxseDJuNnZoa21mMDUzNmR2NTd3ZmdlIiwicG9vbCI6Im9yYWkxNXVuOG1zeDNuNXpmOWFobHhtZmVxZDJrd2E1d20wbnJweGVyMzA0bTluZDVxNnFxMGc2c2t1NXBkZC1vcmFpMWx1czBmMHJoeDhzMDNnZGxseDJuNnZoa21mMDUzNmR2NTd3ZmdlLTMwMDAwMDAwMDAtMTAwIn0seyJkZW5vbV9pbiI6Im9yYWkxbHVzMGYwcmh4OHMwM2dkbGx4Mm42dmhrbWYwNTM2ZHY1N3dmZ2UiLCJkZW5vbV9vdXQiOiJvcmFpIiwicG9vbCI6Im9yYWkxbTZxNWs1bnIyZWg4cTByZHJmNTd3cjdwaGs3dXZscGc3bXdmdjUifV19fX19"
  }
}
 */

export default {
  parseCosmwasm,
}
