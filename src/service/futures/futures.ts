import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import Container, { Service } from "typedi";
import { CONFIG } from '../../util';
import { FuturesData, OpenPositionResponse, FuturesReponse, ClosePositionResponse, UpdateTpSlResponse, DepositMarginResponse } from "./futures.dto";
import { Attribute, Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ORAI_CONTRACT } from "../../server/constant/contractAddress";


@Service({
  factory: (data: { id: string }) => new FuturesCosmos(data.id),
  transient: true,
})
export class FuturesCosmos {
  private readonly connector: TatumConnector;
  private readonly config: TatumConfig;

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
  }

  public parseFuturesAction(data: FuturesData): FuturesReponse {
    let response: FuturesReponse = {} as any
    const evs = data.events.filter(
      (e: Event) => 
        e.type === 'wasm'
        && e.attributes.some((attr) => 
          attr.key === "_contract_address" && 
          attr.value === ORAI_CONTRACT.FUTURES
        )
    )

    const msg = MsgExecuteContract.decode(data.message[0].value)
    const msgValue = JSON.parse(new TextDecoder().decode(msg.msg))
    const action = Object.keys(msgValue)[0]

    switch(action) {
      case 'open_position': {
        response = this.parseOpenPosition({sender: data.sender, events: evs, message: data.message})
        break;
      }
      case 'close_position': {
        response = this.parseClosePosition({sender: data.sender, events: evs, message: data.message})
        break;
      }
      case 'update_tp_sl': {
        response = this.parseUpdateTpSl({sender: data.sender, events: evs, message: data.message})
        break;
      }
      case 'deposit_margin': {
        response = this.parseDepositMargin({sender: data.sender, events: evs, message: data.message})
        break;
      }
      default:
        break;
    }

    return response
  }

  parseOpenPosition(data: FuturesData): OpenPositionResponse {
    let response: OpenPositionResponse = {} as any
    const evs = combiningEvents(data.events.filter(
      (e: Event) => 
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position') ||
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position_reply')
    ));

    for(let e of evs) {
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

    return response
  }

  parseClosePosition(data: FuturesData): ClosePositionResponse {
    let response: ClosePositionResponse = {} as any
    const evs = combiningEvents(data.events.filter(
      (e: Event) =>
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position') ||
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position_reply')
    ));

    for(let e of evs) {
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

    return response
  }

  parseUpdateTpSl(data: FuturesData): UpdateTpSlResponse {
    let response: UpdateTpSlResponse = {} as any
    const evs = combiningEvents(data.events.filter(
      (e: Event) =>
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'update_tp_sl')
    ));

    for(let e of evs) {
      if(e.action === 'update_tp_sl') {
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

  parseDepositMargin(data: FuturesData): DepositMarginResponse {
    let response: DepositMarginResponse = {} as any
    const evs = combiningEvents(data.events.filter(
      (e: Event) =>
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'deposit_margin')
    ));

    for(let e of evs) {
      if(e.action === 'deposit_margin') {
        response.action = e.action
        response.trader = e.trader
        response.positionId = e.position_id
        response.depositAmount = e.deposit_amount
      }
    }

    return response
  }
}

function combiningEvents(evs: Event[]): any[] {
  const messages: any[] = [];
    if (Array.isArray(evs)) {
      for (let e of evs) {
        const result = e?.attributes.reduce((obj: { [key: string]: any; }, attr: Attribute) => {
          if (attr.key in obj) {
            obj[attr.key] = [obj[attr.key], attr.value];
            return obj;
          }
          obj[attr.key] = attr.value;
          return obj;
        }, {} as any) || {};
        messages.push(result);
      }
    }
  return messages
}

