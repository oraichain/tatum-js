import { Event } from "@cosmjs/stargate"

export interface FuturesData {
  sender: string
  message?: any
  events: readonly Event[]
}

export interface OpenPositionResponse {
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

export interface ClosePositionResponse {
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

export interface UpdateTpSlResponse {
  action: string
  pair: string
  trader: string
  positionId: string
  takeProfit: string
  stopLoss: string
}

export interface DepositMarginResponse {
  action: string
  trader: string
  positionId: string
  depositAmount: string
}

export type FuturesReponse = | OpenPositionResponse | ClosePositionResponse | UpdateTpSlResponse | DepositMarginResponse