import { Container, Service } from 'typedi'
import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'
import { OraiSwapData, EvmSwapData, SwapResponse, OraiSwapResponse } from './swap.dto'
import { Event, Attribute } from '@cosmjs/stargate'

const ORAI_SWAP_CONTRACT_ADDRESS = "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a"

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
        e.type=== 'wasm' &&
        e.attributes.some(
            (attr) =>
              attr.key === "_contract_address" &&
              attr.value === ORAI_SWAP_CONTRACT_ADDRESS
                
          ) &&
        e.attributes.some(
          (attr) => attr.key === "action" && attr.value === "swap"
        )
    );
    
    let res: OraiSwapResponse = {
      contractAddress: '',
      fromAddress: '',
      poolKey: '',
      x_to_y: '',
      amountIn: '',
      amountOut: '',
      currentTick: '',
      currentSqrtPrice: '',
      liquidity: '',
    };

    if (Array.isArray(evs)) {
      for (let ev of evs) {
        for (let attr of ev.attributes) {
          switch(attr.key) {
            case "_contract_address": {
              res.contractAddress = attr.value
              break;
            }
            case "sender": {
              res.fromAddress = attr.value;
              break;
            }
            case "pool_key": {
              res.poolKey = attr.value;
              break;
            }
            case "x_to_y": {
              res.x_to_y = attr.value;
              break;
            }
            case "amount_in": {
              res.amountIn = attr.value;
              break;
            }
            case "amount_out": {
              res.amountOut = attr.value;
              break;
            }
            case "current_tick": {
              res.currentTick = attr.value;
              break;
            }
            case "current_sqrt_price": {
              res.currentSqrtPrice = attr.value
              break;
            }
            case "liquidity": {
              res.liquidity = attr.value;
              break;
            }
            default:
              break;
          }
        }
      }
    }
          
    return {
      data: res,
      error: undefined,
      status: Status.SUCCESS,
    }
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
