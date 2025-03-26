import { Event } from '@cosmjs/stargate'

import { TokenInfo } from '../common-info'

export interface CreateDenomCosmosData {
  message: any
  events: Event[]
}

export interface CreateDenomResponse {
  name: string
  symbol: string
  baseDenom: string
  exponent: string
  description: string
}

export interface CreatePoolV2CosmosData extends CreateDenomCosmosData {}

export interface CreatePoolV2Response {
  creator: string
  poolContract: string
  liquidityContract: string
  liquidityShare: string
  tokenXInfo: { amount: string } & TokenInfo
  tokenYInfo: { amount: string } & TokenInfo
}

export interface AddLiquidityV2CosmosData extends CreateDenomCosmosData {}

export interface AddLiquidityV2Response {
  adder: string
  liquidityShare: string
  tokenXInfo: { amount: string } & TokenInfo
  tokenYInfo: { amount: string } & TokenInfo
}

export interface WithdrawLiquidityV2CosmosData extends CreateDenomCosmosData {}

export interface WithdrawLiquidityV2Response extends Omit<AddLiquidityV2Response, 'adder'> {
  withdrawer: string
}

export interface CreatePoolV3CosmosData extends CreateDenomCosmosData {}

export interface PoolV3Info {
  tokenId: string
  positionLiquidity: string
  afterLiquidity: string
  lowerTick: string
  upperTick: string
  aterTickIndex: string
  currentSqrtPrice: string
}

export interface CreatePoolV3Response {
  creator: string
  poolInfo: PoolV3Info
  tokenXInfo: { amount: string } & TokenInfo
  tokenYInfo: { amount: string } & TokenInfo
}

export interface ClaimFeeCosmosData extends CreateDenomCosmosData {}

export interface ClaimFeeResponse {
  claimer: string
  incentiveInfo: { amount: string } & TokenInfo
  tokenXInfo: { amount: string } & TokenInfo
  tokenYInfo: { amount: string } & TokenInfo
}
