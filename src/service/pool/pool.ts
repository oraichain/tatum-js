import { Event } from '@cosmjs/stargate'
import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { CommonInfoCosmos } from '../common-info'
import { TatumConfig } from '../tatum'
import {
  CreateDenomCosmosData,
  CreateDenomResponse,
  CreatePoolV2CosmosData,
  CreatePoolV2Response,
} from './pool.dto'

@Service({
  factory: (data: { id: string }) => new PoolCosmos(data.id),
  transient: true,
})
export class PoolCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }

  /**
   * Parse Create Denom msg
   */
  async parseCreateDenom(data: CreateDenomCosmosData): Promise<ResponseDto<CreateDenomResponse | null>> {
    let returnData: CreateDenomResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const setDenomEvent = data.events.find((event) => event.type === 'set_denom_metadata')
      if (!setDenomEvent) {
        throw new Error('Set Denom Event not found')
      }

      for (const attribute of setDenomEvent.attributes) {
        switch (attribute.key) {
          case 'denom':
            returnData.baseDenom = attribute.value
            break
          case 'denom_metadata':
            const rawMetadata = attribute.value
            returnData.description = rawMetadata.split('description')[1].split(':')[1].split('"')[1]
            returnData.name = rawMetadata.split('name')[1].split('"')[1]
            returnData.symbol = rawMetadata.split('symbol')[1].split('"')[1]
            returnData.exponent = rawMetadata.split('exponent')[1].split('>')[0].split(':')[1].trim()
            break
          default:
            break
        }
      }
    } catch (err: any) {
      error = err
      status = Status.ERROR
    }

    return {
      data: Object.keys(returnData).length === 0 ? null : returnData,
      error,
      status,
    }
  }

  /**
   * Parse Create Pool V2 msg
   */
  async parseCreatePoolV2(data: CreatePoolV2CosmosData): Promise<ResponseDto<CreatePoolV2Response | null>> {
    let returnData: CreatePoolV2Response = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []

      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let createPairEvent: Event | null = null
      let provideLiquidityEvent: Event | null = null
      let pairContractEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'create_pair') {
            createPairEvent = event
          }

          if (attr.key === 'action' && attr.value === 'provide_liquidity') {
            provideLiquidityEvent = event
          }

          if (attr.key === 'pair_contract_address') {
            pairContractEvent = event
          }
        }
      }

      if (!createPairEvent || !provideLiquidityEvent || !pairContractEvent) {
        throw new Error('Event not found')
      }

      // Get pair contract and liquidity contract
      for (const attr of pairContractEvent.attributes) {
        switch (attr.key) {
          case 'pair_contract_address':
            returnData.poolContract = attr.value
            break
          case 'liquidity_token_addr':
            returnData.liquidityContract = attr.value
            break
          default:
            break
        }
      }

      // Get tokens id from pair
      const pairs = createPairEvent.attributes.find((attr) => attr.key === 'pair')?.value
      if (!pairs) {
        throw new Error('Pair not found')
      }
      const [tokenXId, tokenYId] = pairs.split('-')

      // Get token info
      let tokenXAmount: string = ''
      let tokenYAmount: string = ''
      for (const attr of provideLiquidityEvent.attributes) {
        switch (attr.key) {
          case 'assets':
            const [assetX, assetY] = attr.value.split(',')
            tokenXAmount = assetX.trim().split(tokenXId)[0].trim()
            tokenYAmount = assetY.trim().split(tokenYId)[0].trim()
            break
          case 'receiver':
            returnData.creator = attr.value
            break
          case 'share':
            returnData.liquidityShare = attr.value
            break
          default:
            break
        }
      }

      const tokenInfos = (await this.commonInfo.getTokenInfos({ tokenIds: [tokenXId, tokenYId] })).data
      returnData.tokenXInfo = {
        name: tokenInfos[0].name,
        denom: tokenInfos[0].denom,
        amount: tokenXAmount,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.tokenYInfo = {
        name: tokenInfos[1].name,
        denom: tokenInfos[1].denom,
        amount: tokenYAmount,
        decimal: tokenInfos[1].decimal,
        coinGeckoId: tokenInfos[1].coinGeckoId,
        icon: tokenInfos[1].icon,
      }
    } catch (err: any) {
      error = err
      status = Status.ERROR
    }

    return {
      data: Object.keys(returnData).length === 0 ? null : returnData,
      error,
      status,
    }
  }
}

@Service({
  factory: (data: { id: string }) => new PoolEvm(data.id),
  transient: true,
})
export class PoolEvm {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }
}
