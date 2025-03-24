import { Event } from '@cosmjs/stargate'

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
