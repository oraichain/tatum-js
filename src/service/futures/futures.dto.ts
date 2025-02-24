import { Event } from "@cosmjs/stargate"
import { TokenInfo } from "../common-info"

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
  tokenInfo: TokenInfo
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
  tokenInfo: TokenInfo
}

export interface UpdateTpSlResponse {
  action: string
  pair: string
  trader: string
  positionId: string
  takeProfit: string
  stopLoss: string
  tokenInfo: TokenInfo
}

export interface DepositMarginResponse {
  action: string
  trader: string
  positionId: string
  depositAmount: string
  tokenInfo: TokenInfo
}

export type FuturesReponse = | OpenPositionResponse | ClosePositionResponse | UpdateTpSlResponse | DepositMarginResponse