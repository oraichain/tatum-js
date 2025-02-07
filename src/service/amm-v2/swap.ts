import { Container, Service } from 'typedi'
import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'
import { CosmosSwapData, EvmSwapData, SwapResponse } from './swap.dto'

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
  async parseSwap(data: CosmosSwapData): Promise<ResponseDto<SwapResponse>> {
    return {
      data: {
        decimals: 6,
        fromAddress: 'cosmos',
        toAddress: 'cosmos',
        inAmount: '1',
        outAmount: '1',
        minimumReceive: '1',
      },
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
