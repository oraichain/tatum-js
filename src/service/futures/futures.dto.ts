import { Event } from "@cosmjs/stargate"

export interface FuturesData {
  sender: string
  message?: any
  events: readonly Event[]
}