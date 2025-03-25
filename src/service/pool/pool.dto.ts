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
