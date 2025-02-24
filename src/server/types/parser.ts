export type ParseInput = {
  sender: string
  messages: Message[]
  action: string
}

export type ParserBody = {
  sender: string
  messages: Message[]
}

export type ParseApiInput = ParserBody

export type SimulateMsg = {
  typeUrl: string
  value: Uint8Array
}

export type Message = {
  typeUrl: string
  value: string
}
