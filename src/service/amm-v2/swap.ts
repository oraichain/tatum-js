import { Container, Service } from 'typedi'
import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'
import { OraiSwapData, EvmSwapData, SwapResponse, OraiSwapOperations, OraiSwapAndActionResponse, SwapAction, PostSwapAction } from './swap.dto'
import { Event, Attribute } from '@cosmjs/stargate'

const ORAI_SWAP_CONTRACT_ADDRESS = "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a"
const ORAI_SWAP_AND_ACTION_CONTRACT_ADDRESS = "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0"

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
  async parseSwap(data: OraiSwapData): Promise<ResponseDto<SwapResponse>> {
    const evs = data.events.filter(
      (e: Event) =>
        e.type === 'wasm' &&
        e.attributes.some(
          (attr) => attr.key === "action" && attr.value === "swap"
        )
    );
    
    let res: OraiSwapOperations[] = [];

    if (Array.isArray(evs)) {
      for (let ev of evs) {
        if (ev.attributes.some((attr) => 
          attr.key === "_contract_address" && attr.value === ORAI_SWAP_CONTRACT_ADDRESS
        )) {
          let op = await this.parseSwapCw20(ev)
          res.push(op)
        } else {
          let op = await this.parseSwapNative(ev)
          res.push(op)
        }
      }
    }
          
    return {
      data: res,
      error: undefined,
      status: Status.SUCCESS,
    }
  }

  async parseSwapAndAction(data: OraiSwapData): Promise<ResponseDto<SwapResponse>> {
    let ops = ((await this.parseSwap(data)).data as OraiSwapOperations[])

    const evs = data.events.filter(
      (e: Event) =>
        e.type === 'wasm' &&
        e.attributes.some(
          (attr) => attr.key === "_contract_address" && attr.value === ORAI_SWAP_AND_ACTION_CONTRACT_ADDRESS
        )
    );

    const swapAction = evs.find(
      (e: Event) =>
        e.attributes.some(
          (attr) => attr.key === "action" && attr.value === "execute_user_swap"
        )
    )?.attributes.reduce((obj: { [key: string]: any }, attr: Attribute) => {
      if (attr.key in obj) {
        obj[attr.key] = [obj[attr.key], attr.value];
        return obj;
      }
      obj[attr.key] = attr.value;
      return obj;
    }, {} as any) || {};

    const postSwapAction = evs.find(
      (e: Event) =>
        e.attributes.some(
          (attr) => attr.key === "action" && attr.value === "execute_post_swap_action"
        )
    )?.attributes.reduce((obj: { [key: string]: any }, attr: Attribute) => {
      if (attr.key in obj) {
        obj[attr.key] = [obj[attr.key], attr.value];
        return obj;
      }
      obj[attr.key] = attr.value;
      return obj;
    }, {} as any) || {};

    const res: OraiSwapAndActionResponse = {
      operations: ops,
      postAction: {
        swapAction: swapAction as SwapAction,
        postSwapAction: postSwapAction as PostSwapAction,
      },
    }

    return {
      data: res,
      error: undefined,
      status: Status.SUCCESS,
    }
  }

  private async parseSwapNative(event: Event): Promise<OraiSwapOperations> {
    let res: OraiSwapOperations = {};
    for (let attr of event.attributes) {
      switch(attr.key) {
        case "_contract_address": {
          res.contractAddress = attr.value;
          break;
        }
        case "sender": {
          res.sender = attr.value;
          break;
        }
        case "receiver": {
          res.receiver = attr.value;
          break;
        }
        case "offer_asset": {
          res.offerAsset = attr.value;
          break;
        }
        case "ask_asset": {
          res.askAsset = attr.value;
          break;
        } 
        case "offer_amount": {
          res.offerAmount = attr.value;
          break;
        }
        case "return_amount": {
          res.returnAmount = attr.value;
          break;
        }
       
        default:
          break;
        }
      }
    return res
  }

  private async parseSwapCw20(event: Event): Promise<OraiSwapOperations> {
    let res: OraiSwapOperations = {};
    let x_to_y: boolean = false;
    let poolKey: string[] = [];
    for (let attr of event.attributes) {
      switch(attr.key) {
        case "_contract_address": {
          res.contractAddress = attr.value;
          break;
        }
        case "sender": {
          res.sender = attr.value;
          res.receiver = attr.value;
          break;
        }
        case "amount_in": {
          res.offerAmount = attr.value;
          break;
        }
        case "amount_out": {
          res.returnAmount = attr.value;
          break;
        }
        case "pool_key": {
          poolKey = attr.value.split("-");
          break;
        }
        case "x_to_y": {
          x_to_y = JSON.parse(attr.value);
          break;
        }
        default:
          break;
        }
      }

      if (x_to_y === true) {
        res.offerAsset = poolKey[0]
        res.askAsset = poolKey[1];
      } else {
        res.offerAsset = poolKey[1];
        res.askAsset = poolKey[0];
      }
      return res
  }
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
  async parseSwap(data: EvmSwapData): Promise<ResponseDto<SwapResponse>> {
    return {
      data: {
        decimals: 6,
        fromAddress: 'evm',
        toAddress: 'evm',
        inAmount: '1',
        outAmount: '1',
        minimumReceive: '1',
      },
      error: undefined,
      status: Status.SUCCESS,
    }
  }
}
