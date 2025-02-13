import { Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { Container, Service } from 'typedi'
import {fromUtf8, fromBase64} from '@cosmjs/encoding'
import { TatumConnector } from '../../connector'
import { CONFIG } from '../../util'
import { TatumConfig } from '../tatum'
import { OraiSwapData, OraiSwapOperations, SwapResponse } from './swap.dto'

const ORAI_SWAP_CONTRACT_ADDRESS = 'orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a'
const ORAI_SWAP_AND_ACTION_CONTRACT_ADDRESS =
  'orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0'

@Service({
  factory: (data: { id: string }) => new AmmV2Cosmos(data.id),
  transient: true,
})
export class AmmV2Cosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.config = Container.of(this.id).get(CONFIG)
    this.connector = Container.of(this.id).get(TatumConnector)
  }

  /**
   * Get balance of all tokens for a given Tezos address.
   */
  parseSwap(data: OraiSwapData): SwapResponse {
    // decode events
    const evs = data.events.filter(
      (e: Event) =>
        e.type === 'wasm' && e.attributes.some((attr) => attr.key === 'action' && attr.value === 'swap'),
    )

    let ops: OraiSwapOperations[] = []

    if (Array.isArray(evs)) {
      for (let ev of evs) {
        if (
          ev.attributes.some(
            (attr) => attr.key === '_contract_address' && attr.value === ORAI_SWAP_CONTRACT_ADDRESS,
          )
        ) {
          let op = this.parseSwapCw20(ev)
          ops.push(op)
        } else {
          let op = this.parseSwapNative(ev)
          ops.push(op)
        }
      }
    }

    let res: SwapResponse = {
      fromAddress: data.sender,
      toAddress: data.sender!,
      inAsset: ops[0].offerAsset!,
      inAmount: ops[0].offerAmount!,
      outAsset: ops[ops.length - 1].askAsset!,
      outAmount: ops[ops.length - 1].returnAmount!,
    }

    return res
  }

  parseSwapAndAction(data: OraiSwapData): SwapResponse {
    // decode events
    let swapInfo = this.parseSwap(data)

    // decode messages
    if (data.message != null) {
      const msg = MsgExecuteContract.decode(data.message[0].value)
      const msgValue = new TextDecoder().decode(msg.msg)
      swapInfo.toAddress = JSON.parse(msgValue).swap_and_action.post_swap_action
    }

    return swapInfo
  }

  private parseSwapNative(event: Event): OraiSwapOperations {
    let res: OraiSwapOperations = {}
    for (let attr of event.attributes) {
      switch (attr.key) {
        case '_contract_address': {
          res.contractAddress = attr.value
          break
        }
        case 'sender': {
          res.sender = attr.value
          break
        }
        case 'receiver': {
          res.receiver = attr.value
          break
        }
        case 'offer_asset': {
          res.offerAsset = attr.value
          break
        }
        case 'ask_asset': {
          res.askAsset = attr.value
          break
        }
        case 'offer_amount': {
          res.offerAmount = attr.value
          break
        }
        case 'return_amount': {
          res.returnAmount = attr.value
          break
        }

        default:
          break
      }
    }
    return res
  }

  private parseSwapCw20(event: Event): OraiSwapOperations {
    let res: OraiSwapOperations = {}
    let x_to_y: boolean = false
    let poolKey: string[] = []
    for (let attr of event.attributes) {
      switch (attr.key) {
        case '_contract_address': {
          res.contractAddress = attr.value
          break
        }
        case 'sender': {
          res.sender = attr.value
          res.receiver = attr.value
          break
        }
        case 'amount_in': {
          res.offerAmount = attr.value
          break
        }
        case 'amount_out': {
          res.returnAmount = attr.value
          break
        }
        case 'pool_key': {
          poolKey = attr.value.split('-')
          break
        }
        case 'x_to_y': {
          x_to_y = JSON.parse(attr.value)
          break
        }
        default:
          break
      }
    }

    if (x_to_y === true) {
      res.offerAsset = poolKey[0]
      res.askAsset = poolKey[1]
    } else {
      res.offerAsset = poolKey[1]
      res.askAsset = poolKey[0]
    }
    return res
  }
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
@Service({
  factory: (data: { id: string }) => {
    return new AmmV2Evm(data.id)
  },
  transient: true,
})
export class AmmV2Evm {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.config = Container.of(this.id).get(CONFIG)
    this.connector = Container.of(this.id).get(TatumConnector)
  }

  /**
   * Get balance of all tokens for a given Tezos address.
   */
  // async parseSwap(data: EvmSwapData): Promise<ResponseDto<SwapResponse>> {
  //   return {
  //     data: {
  //       decimals: 6,
  //       fromAddress: 'evm',
  //       toAddress: 'evm',
  //       inAmount: '1',
  //       outAmount: '1',
  //       minimumReceive: '1',
  //     },
  //     error: undefined,
  //     status: Status.SUCCESS,
  //   }
  // }
}
