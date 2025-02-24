import { Attribute, Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import Container, { Service } from 'typedi'
import { TatumConnector } from '../../connector'
import { ORAI_CONTRACT, ORAI_TOKEN_CONTRACTS } from '../../server/constant/contractAddress'
import { CONFIG } from '../../util'
import { TatumConfig } from '../tatum'
import { combiningEvents } from '../../util/decode'
import {
  ClosePositionResponse,
  DepositMarginResponse,
  FuturesData,
  FuturesReponse,
  OpenPositionResponse,
  UpdateTpSlResponse,
} from './futures.dto'
import { CommonInfoCosmos } from '../common-info'

@Service({
  factory: (data: { id: string }) => new FuturesCosmos(data.id),
  transient: true,
})
export class FuturesCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }

  public async parseFuturesAction(data: FuturesData, action?: string): Promise<FuturesReponse> {
    let response: FuturesReponse = {} as any
    let futuresAction = action
    const evs = data.events.filter(
      (e: Event) => 
        e.type === 'wasm'
        && e.attributes.some((attr) => 
          attr.key === "_contract_address" && 
          attr.value === ORAI_CONTRACT.FUTURES
        )
    )

    if (futuresAction === null) {
      const msg = MsgExecuteContract.decode(data.message[0].value)
      const msgValue = JSON.parse(new TextDecoder().decode(msg.msg))
      futuresAction = Object.keys(msgValue)[0]
    }

    switch (futuresAction) {
      case 'open_position': {
        response = await this.parseOpenPosition({ sender: data.sender, events: evs, message: data.message })
        break
      }
      case 'close_position': {
        response = await this.parseClosePosition({ sender: data.sender, events: evs, message: data.message })
        break
      }
      case 'update_tp_sl': {
        response = this.parseUpdateTpSl({ sender: data.sender, events: evs, message: data.message })
        break
      }
      case 'deposit_margin': {
        response = await this.parseDepositMargin({ sender: data.sender, events: evs, message: data.message })
        break
      }
      default:
        break
    }

    return response
  }

  async parseOpenPosition(data: FuturesData): Promise<OpenPositionResponse> {
    let response: OpenPositionResponse = {} as any
    const evs = combiningEvents(
      data.events.filter(
        (e: Event) =>
          e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position') ||
          e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position_reply'),
      ),
    )

    for (let e of evs) {
      if (e.action === 'open_position') {
        response.action = e.action
        response.positionId = e.position_id
        response.positionSide = e.position_side
        response.pair = e.pair
        response.trader = e.trader
        response.marginAmount = e.margin_amount
        response.leverage = e.leverage
        response.tp = e.take_profit
        response.sl = e.stop_loss
      } else if (e.action == 'open_position_reply') {
        response.entryPrice = e.entry_price
      }
    }

    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: ORAI_TOKEN_CONTRACTS.USDC})).data

    return response
  }

  async parseClosePosition(data: FuturesData): Promise<ClosePositionResponse> {
    let response: ClosePositionResponse = {} as any
    const evs = combiningEvents(
      data.events.filter(
        (e: Event) =>
          e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position') ||
          e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position_reply'),
      ),
    )

    for (let e of evs) {
      if (e.action === 'close_position') {
        response.action = e.action
        response.positionId = e.position_id
        response.positionSide = e.position_side
        response.pair = e.pair
        response.trader = e.trader
        response.marginAmount = e.margin_amount
        response.leverage = e.leverage
        response.entryPrice = e.entry_price
      } else if (e.action == 'close_position_reply') {
        response.tp = e.take_profit
        response.sl = e.stop_loss
        response.pnl = e.pnl
        response.fundingPayment = e.funding_payment
        response.badDebt = e.bad_debt
        response.withdrawAmount = e.withdraw_amount
      }
    }

    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: ORAI_TOKEN_CONTRACTS.USDC})).data

    return response
  }

  parseUpdateTpSl(data: FuturesData): UpdateTpSlResponse {
    let response: UpdateTpSlResponse = {} as any
    const evs = combiningEvents(
      data.events.filter((e: Event) =>
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'update_tp_sl'),
      ),
    )

    for (let e of evs) {
      if (e.action === 'update_tp_sl') {
        response.action = e.action
        response.pair = e.pair
        response.trader = e.trader
        response.positionId = e.position_id
        response.takeProfit = e.take_profit
        response.stopLoss = e.stop_loss
      }
    }

    return response
  }

  async parseDepositMargin(data: FuturesData): Promise<DepositMarginResponse> {
    let response: DepositMarginResponse = {} as any
    const evs = combiningEvents(
      data.events.filter((e: Event) =>
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'deposit_margin'),
      ),
    )

    for (let e of evs) {
      if (e.action === 'deposit_margin') {
        response.action = e.action
        response.trader = e.trader
        response.positionId = e.position_id
        response.depositAmount = e.deposit_amount
      }
    }

    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: ORAI_TOKEN_CONTRACTS.USDC})).data

    return response
  }
}
