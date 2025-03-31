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
  ClaimFeeCosmosData,
  ClaimFeeResponse,
  CreateDenomCosmosData,
  CreateDenomResponse,
  CreatePoolV2CosmosData,
  CreatePoolV2Response,
  CreatePoolV3CosmosData,
  CreatePoolV3Response,
  PoolV3Info,
  RemovePositionV3CosmosData,
  RemovePositionV3Response,
  UnbondPoolV2CosmosData,
  UnbondPoolV2Response,
  WithdrawLiquidityV2CosmosData,
  WithdrawLiquidityV2Response,
  ZapInPoolV3CosmosData,
  ZapInPoolV3Response,
  ZapOutPoolV3CosmosData,
  ZapOutPoolV3Response,
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
   * Parse Unbond Pool V2 msg
   */
  async parseUnbondPoolV2(data: UnbondPoolV2CosmosData): Promise<ResponseDto<UnbondPoolV2Response | null>> {
    let returnData: UnbondPoolV2Response = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let unbondPoolEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'unbond') {
            unbondPoolEvent = event
          }
        }
      }

      if (!unbondPoolEvent) {
        throw new Error('Unbond Pool Event not found')
      }

      let tokenAmount: string = ''
      let tokenId: string = ''
      for (const attr of unbondPoolEvent.attributes) {
        switch (attr.key) {
          case 'staker_addr':
            returnData.staker = attr.value
            break
          case 'staking_token':
            tokenId = attr.value
            break
          case 'amount':
            tokenAmount = attr.value
            break
          default:
            break
        }
      }

      const tokenResponse = await this.commonInfo.getTokenInfo({ tokenId })
      if (tokenResponse.status === Status.ERROR) {
        throw new Error('Token not found')
      }

      returnData.tokenInfo = {
        name: tokenResponse.data.name,
        denom: tokenResponse.data.denom,
        amount: tokenAmount,
        decimal: tokenResponse.data.decimal,
        coinGeckoId: tokenResponse.data.coinGeckoId,
        icon: tokenResponse.data.icon,
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
            const lowerTick = parseInt(attr.value)
            poolInfo.lowerTick = Math.pow(1.0001, lowerTick).toString()
            break
          case 'upper_tick':
            const upperTick = parseInt(attr.value)
            poolInfo.upperTick = Math.pow(1.0001, upperTick).toString()
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

  /**
   * Parse Zap Pool V3 msg
   */
  async parseZapInPoolV3(data: ZapInPoolV3CosmosData): Promise<ResponseDto<ZapInPoolV3Response | null>> {
    let returnData: ZapInPoolV3Response = {} as any
    let poolInfo: PoolV3Info = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      const txEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }

        if (event.type === 'tx') {
          txEvents.push(event)
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

      for (const event of txEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'fee_payer') {
            returnData.zapper = attr.value
          }
        }
      }

      for (const attr of createPoolEvent.attributes) {
        switch (attr.key) {
          case 'token_id':
            poolInfo.tokenId = attr.value
            break
          case 'position_liquidity':
            poolInfo.positionLiquidity = attr.value
            break
          case 'lower_tick':
            const lowerTick = parseInt(attr.value)
            poolInfo.lowerTick = Math.pow(1.0001, lowerTick).toString()
            break
          case 'upper_tick':
            const upperTick = parseInt(attr.value)
            poolInfo.upperTick = Math.pow(1.0001, upperTick).toString()
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
          default:
            break
        }
      }

      returnData.poolInfo = poolInfo

      let usdtEvent: Event | null = null
      for (const event of wasmEvents) {
        let isUsdtContract = false
        let transferFromAction = false
        let isOwner = false

        for (const attr of event.attributes) {
          if (
            attr.key === '_contract_address' &&
            attr.value === 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'
          ) {
            isUsdtContract = true
          }

          if (attr.key === 'action' && attr.value === 'transfer_from') {
            transferFromAction = true
          }

          if (attr.key === 'from' && attr.value === returnData.zapper) {
            isOwner = true
          }
        }

        if (isUsdtContract && transferFromAction && isOwner) {
          usdtEvent = event
        }
      }

      if (!usdtEvent) {
        throw new Error('USDT Event not found')
      }

      const usdtAmount = usdtEvent.attributes.find((attr) => attr.key === 'amount')?.value!
      const usdtTokenId = 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'
      const usdtInfo = (await this.commonInfo.getTokenInfo({ tokenId: usdtTokenId })).data

      returnData.tokenInfo = {
        name: usdtInfo.name,
        denom: usdtInfo.denom,
        amount: usdtAmount,
        decimal: usdtInfo.decimal,
        coinGeckoId: usdtInfo.coinGeckoId,
        icon: usdtInfo.icon,
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
   * Parse Claim Fee msg
   */
  async parseClaimFee(data: ClaimFeeCosmosData): Promise<ResponseDto<ClaimFeeResponse | null>> {
    let returnData: ClaimFeeResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      let claimFeeEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'claim_fee') {
            claimFeeEvent = event
          }
        }
      }

      if (!claimFeeEvent) {
        throw new Error('Claim Fee Event not found')
      }

      let incentiveTokenId: string = ''
      let incentiveAmount: string = ''
      let tokenXId: string = ''
      let tokenXAmount: string = ''
      let tokenYId: string = ''
      let tokenYAmount: string = ''
      for (const attr of claimFeeEvent.attributes) {
        switch (attr.key) {
          case 'owner':
            returnData.claimer = attr.value
            break
          case 'incentives_amount':
            incentiveAmount = attr.value
            break
          case 'incentives_token_address':
            incentiveTokenId = attr.value
            break
          case 'pool_key':
            const splitTokenIds = attr.value.split('-')
            tokenXId = splitTokenIds[0]
            tokenYId = splitTokenIds[1]
            break
          case 'amount_x':
            tokenXAmount = attr.value
            break
          case 'amount_y':
            tokenYAmount = attr.value
            break
          default:
            break
        }
      }

      const tokenInfos = (
        await this.commonInfo.getTokenInfos({ tokenIds: [tokenXId, tokenYId, incentiveTokenId] })
      ).data

      returnData.tokenXInfo = {
        name: tokenInfos[0].name,
        amount: tokenXAmount,
        denom: tokenInfos[0].denom,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.tokenYInfo = {
        name: tokenInfos[1].name,
        amount: tokenYAmount,
        denom: tokenInfos[1].denom,
        decimal: tokenInfos[1].decimal,
        coinGeckoId: tokenInfos[1].coinGeckoId,
        icon: tokenInfos[1].icon,
      }

      returnData.incentiveInfo = {
        name: tokenInfos[2].name,
        amount: incentiveAmount,
        denom: tokenInfos[2].denom,
        decimal: tokenInfos[2].decimal,
        coinGeckoId: tokenInfos[2].coinGeckoId,
        icon: tokenInfos[2].icon,
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
   * Parse Remove Position V3 msg
   */
  async parseRemovePositionV3(
    data: RemovePositionV3CosmosData,
  ): Promise<ResponseDto<RemovePositionV3Response | null>> {
    let returnData: RemovePositionV3Response = {} as any
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

      let removePositionEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'remove_position') {
            removePositionEvent = event
          }
        }
      }

      if (!removePositionEvent) {
        throw new Error('Remove Position Event not found')
      }

      let incentiveTokenId: string = ''
      let incentiveAmount: string = ''
      let tokenXId: string = ''
      let tokenXAmount: string = ''
      let tokenYId: string = ''
      let tokenYAmount: string = ''
      for (const attr of removePositionEvent.attributes) {
        switch (attr.key) {
          case 'owner':
            returnData.remover = attr.value
            break
          case 'incentives_token_address':
            incentiveTokenId = attr.value
            break
          case 'incentives_amount':
            incentiveAmount = attr.value
            break
          case 'pool_key':
            const splitTokenIds = attr.value.split('-')
            tokenXId = splitTokenIds[0]
            tokenYId = splitTokenIds[1]
            break
          case 'liquidity_x':
            tokenXAmount = attr.value
            break
          case 'liquidity_y':
            tokenYAmount = attr.value
            break
          case 'token_id':
            poolInfo.tokenId = attr.value
            break
          case 'position_liquidity':
            poolInfo.positionLiquidity = attr.value
            break
          case 'lower_tick':
            const lowerTick = parseInt(attr.value)
            poolInfo.lowerTick = Math.pow(1.0001, lowerTick).toString()
            break
          case 'upper_tick':
            const upperTick = parseInt(attr.value)
            poolInfo.upperTick = Math.pow(1.0001, upperTick).toString()
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
          default:
            break
        }
      }

      returnData.poolInfo = poolInfo

      const tokenInfos = (
        await this.commonInfo.getTokenInfos({ tokenIds: [tokenXId, tokenYId, incentiveTokenId] })
      ).data

      returnData.tokenXInfo = {
        name: tokenInfos[0].name,
        amount: tokenXAmount,
        denom: tokenInfos[0].denom,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.tokenYInfo = {
        name: tokenInfos[1].name,
        amount: tokenYAmount,
        denom: tokenInfos[1].denom,
        decimal: tokenInfos[1].decimal,
        coinGeckoId: tokenInfos[1].coinGeckoId,
        icon: tokenInfos[1].icon,
      }

      returnData.incentiveInfo = {
        name: tokenInfos[2].name,
        amount: incentiveAmount,
        denom: tokenInfos[2].denom,
        decimal: tokenInfos[2].decimal,
        coinGeckoId: tokenInfos[2].coinGeckoId,
        icon: tokenInfos[2].icon,
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
   * Parse Zap Out Pool V3 msg
   */
  async parseZapOutPoolV3(data: ZapOutPoolV3CosmosData): Promise<ResponseDto<ZapOutPoolV3Response | null>> {
    let returnData: ZapOutPoolV3Response = {} as any
    let poolInfo: PoolV3Info = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      const txEvents: Event[] = []
      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }

        if (event.type === 'tx') {
          txEvents.push(event)
        }
      }

      let removePositionEvent: Event | null = null
      for (const event of wasmEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'action' && attr.value === 'remove_position') {
            removePositionEvent = event
          }
        }
      }

      if (!removePositionEvent) {
        throw new Error('Remove Position Event not found')
      }

      for (const event of txEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'fee_payer') {
            returnData.zapper = attr.value
          }
        }
      }

      let incentiveTokenId: string = ''
      let incentiveAmount: string = ''
      for (const attr of removePositionEvent.attributes) {
        switch (attr.key) {
          case 'incentives_token_address':
            incentiveTokenId = attr.value
            break
          case 'incentives_amount':
            incentiveAmount = attr.value
            break
          case 'token_id':
            poolInfo.tokenId = attr.value
            break
          case 'position_liquidity':
            poolInfo.positionLiquidity = attr.value
            break
          case 'lower_tick':
            const lowerTick = parseInt(attr.value)
            poolInfo.lowerTick = Math.pow(1.0001, lowerTick).toString()
            break
          case 'upper_tick':
            const upperTick = parseInt(attr.value)
            poolInfo.upperTick = Math.pow(1.0001, upperTick).toString()
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
          default:
            break
        }
      }

      returnData.poolInfo = poolInfo

      let usdtEvents: Event[] = []
      for (const event of wasmEvents) {
        let isUsdtContract = false
        let transferAction = false
        let isOwner = false

        for (const attr of event.attributes) {
          if (
            attr.key === '_contract_address' &&
            attr.value === 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'
          ) {
            isUsdtContract = true
          }

          if (attr.key === 'action' && attr.value === 'transfer') {
            transferAction = true
          }

          if (attr.key === 'to' && attr.value === returnData.zapper) {
            isOwner = true
          }
        }

        if (isUsdtContract && transferAction && isOwner) {
          usdtEvents.push(event)
        }
      }

      let usdtAmount: number = 0
      for (const event of usdtEvents) {
        for (const attr of event.attributes) {
          if (attr.key === 'amount') {
            usdtAmount += parseInt(attr.value)
          }
        }
      }

      const usdtTokenId = 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh'
      const tokenInfos = (await this.commonInfo.getTokenInfos({ tokenIds: [usdtTokenId, incentiveTokenId] }))
        .data

      returnData.tokenInfo = {
        name: tokenInfos[0].name,
        amount: usdtAmount.toString(),
        denom: tokenInfos[0].denom,
        decimal: tokenInfos[0].decimal,
        coinGeckoId: tokenInfos[0].coinGeckoId,
        icon: tokenInfos[0].icon,
      }

      returnData.incentiveInfo = {
        name: tokenInfos[1].name,
        amount: incentiveAmount,
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
