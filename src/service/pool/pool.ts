import { Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { CommonInfoCosmos } from '../common-info'
import { TatumConfig } from '../tatum'
import { splitAmountAndId } from './helpers'
import {
  AddLiquidityV2CosmosData,
  AddLiquidityV2Response,
  CreateDenomCosmosData,
  CreateDenomResponse,
  CreatePoolV2CosmosData,
  CreatePoolV2Response,
  CreatePoolV3CosmosData,
  CreatePoolV3Response,
  PoolV3Info,
  WithdrawLiquidityV2CosmosData,
  WithdrawLiquidityV2Response,
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

  /**
   * Parse Add Liquidity V2 msg
   */
  async parseAddLiquidityV2(
    data: AddLiquidityV2CosmosData,
  ): Promise<ResponseDto<AddLiquidityV2Response | null>> {
    let returnData: AddLiquidityV2Response = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const lastMsgRaw = data.message[data.message.length - 1]
      const value = Uint8Array.from(Buffer.from(lastMsgRaw.value, 'base64'))
      const rawMsg = MsgExecuteContract.decode(value)
      const executeMsg = JSON.parse(new TextDecoder().decode(rawMsg.msg))

      const [assetX, assetY] = executeMsg.provide_liquidity.assets
      const tokenXId = assetX.info.native_token
        ? assetX.info.native_token.denom
        : assetX.info.token.contract_addr
      const tokenYId = assetY.info.native_token
        ? assetY.info.native_token.denom
        : assetY.info.token.contract_addr

      const wasmEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let addLiquidityEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'provide_liquidity') {
            addLiquidityEvent = event
          }
        }
      }

      if (!addLiquidityEvent) {
        throw new Error('Add Liquidity Event not found')
      }

      for (const attr of addLiquidityEvent.attributes) {
        switch (attr.key) {
          case 'receiver':
            returnData.adder = attr.value
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
        amount: assetX.amount,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.tokenYInfo = {
        name: tokenInfos[1].name,
        denom: tokenInfos[1].denom,
        amount: assetY.amount,
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

  /**
   * Parse Withdraw Liquidity V2 msg
   */
  async parseWithdrawLiquidityV2(
    data: WithdrawLiquidityV2CosmosData,
  ): Promise<ResponseDto<WithdrawLiquidityV2Response | null>> {
    let returnData: WithdrawLiquidityV2Response = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let withdrawLiquidityEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'withdraw_liquidity') {
            withdrawLiquidityEvent = event
          }
        }
      }

      if (!withdrawLiquidityEvent) {
        throw new Error('Withdraw Liquidity Event not found')
      }

      let splitAssetX: { amount: string; id: string } | undefined
      let splitAssetY: { amount: string; id: string } | undefined
      for (const attr of withdrawLiquidityEvent.attributes) {
        switch (attr.key) {
          case 'sender':
            returnData.withdrawer = attr.value
            break
          case 'withdrawn_share':
            returnData.liquidityShare = attr.value
            break
          case 'refund_assets':
            const [assetX, assetY] = attr.value.split(',')
            splitAssetX = splitAmountAndId(assetX.trim())
            splitAssetY = splitAmountAndId(assetY.trim())
            break
          default:
            break
        }
      }

      if (!splitAssetX || !splitAssetY) {
        throw new Error('Invalid asset')
      }

      const tokenInfos = (await this.commonInfo.getTokenInfos({ tokenIds: [splitAssetX.id, splitAssetY.id] }))
        .data

      returnData.tokenXInfo = {
        name: tokenInfos[0].name,
        amount: splitAssetX.amount,
        denom: tokenInfos[0].denom,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.tokenYInfo = {
        name: tokenInfos[1].name,
        amount: splitAssetY.amount,
        denom: tokenInfos[1].denom,
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

  /**
   * Parse Create Pool V3 msg
   */
  async parseCreatePoolV3(data: CreatePoolV3CosmosData): Promise<ResponseDto<CreatePoolV3Response | null>> {
    let returnData: CreatePoolV3Response = {} as any
    let poolInfo: PoolV3Info = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let createPoolEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'create_position') {
            createPoolEvent = event
          }
        }
      }

      if (!createPoolEvent) {
        throw new Error('Create Pool Event not found')
      }

      let tokenXId: string = ''
      let tokenYId: string = ''
      let tokenXAmount: string = ''
      let tokenYAmount: string = ''
      for (const attr of createPoolEvent.attributes) {
        switch (attr.key) {
          case 'pool_key':
            const tokenSplits = attr.value.split('-')
            tokenXId = tokenSplits[0]
            tokenYId = tokenSplits[1]
            break
          case 'token_id':
            poolInfo.tokenId = attr.value
            break
          case 'owner':
            returnData.creator = attr.value
            break
          case 'position_liquidity':
            poolInfo.positionLiquidity = attr.value
            break
          case 'lower_tick':
            poolInfo.lowerTick = attr.value
            break
          case 'upper_tick':
            poolInfo.upperTick = attr.value
            break
          case 'current_sqrt_price':
            poolInfo.currentSqrtPrice = attr.value
            break
          case 'after_liquidity':
            poolInfo.afterLiquidity = attr.value
            break
          case 'ater_tick_index':
            poolInfo.aterTickIndex = attr.value
            break
          case 'liquidity_x':
            tokenXAmount = attr.value
            break
          case 'liquidity_y':
            tokenYAmount = attr.value
            break
          default:
            break
        }
      }

      returnData.poolInfo = poolInfo

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
