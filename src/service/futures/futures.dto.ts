import { Event } from "@cosmjs/stargate"

export interface FuturesData {
  sender: string
  message?: any
  events: readonly Event[]
}

export interface OpenPosition {
  action: string
  positionId: string
  positionSide: string
  pair: string
  trader: string
  marginAmount: string
  leverage: string
  tp: string
  sl: string
  entryPrice: string
}

export interface ClosePosition {
  action: string
  positionId: string
  positionSide: string
  pair: string
  trader: string
  marginAmount: string
  leverage: string
  tp: string
  sl: string
  entryPrice: string
  pnl: string
  withdrawAmount: string
  fundingPayment: string
  badDebt: string
}

export type FuturesReponse = OpenPosition | ClosePosition