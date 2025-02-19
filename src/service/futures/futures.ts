import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import Container, { Service } from "typedi";
import { CONFIG } from '../../util';
import { FuturesData, OpenPosition, FuturesReponse, ClosePosition } from "./futures.dto";
import { Attribute, Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";


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

  parseFuturesAction(data: FuturesData): FuturesReponse {
    let response: FuturesReponse = {} as any
    const evs = data.events.filter(
      (e: Event) => 
        e.type === 'wasm'
        && e.attributes.some((attr) => attr.key === "_contract_address" && attr.value === "orai1wrkchuss9wtph4mxrzqksfrulj7hsl89z0048hg8l7hcglse5rxqea2qnr")
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
      default:
        break;
    }

    return response
  }

  parseOpenPosition(data: FuturesData): OpenPosition {
    let response: OpenPosition = {} as any
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

  parseClosePosition(data: FuturesData): ClosePosition {
    let response: ClosePosition = {} as any
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
    console.log(response)
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

