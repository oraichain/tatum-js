import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import Container from "typedi";
import { CONFIG } from '../../util';
import { FuturesData } from "./futures.dto";
import { Attribute, Event } from '@cosmjs/stargate'
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";

export class Futures {
  private readonly connector: TatumConnector;
  private readonly config: TatumConfig;

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
  }

  parseFuturesAction(data: FuturesData) {
    let response
    const evs = data.events.filter(
      (e: Event) => {
        e.type === 'wasm' && e.attributes.some((attr) => {
          attr.key === "_contract_address" && attr.value === "orai1wrkchuss9wtph4mxrzqksfrulj7hsl89z0048hg8l7hcglse5rxqea2qnr"
        })
      }
    )

    const msg = MsgExecuteContract.decode(data.message[0].value)
    const msgValue = new TextDecoder().decode(msg.msg)
    const action = Object.keys(msgValue)[0]

    switch(action) {
      case 'open_position': {
        response = this.parseOpenPosition({sender: data.sender, events: evs, message: data.message})
        break;
      }
      case 'close_position': {
        break;
      }
      default:
        break;
    }

    return response
  }

  parseOpenPosition(data: FuturesData) {
    const evs = data.events.filter(
      (e: Event) => {
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position') ||
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'open_position_reply')
      }
    );

    return combiningEvents(evs)
  }

  parseClosePosition(data: FuturesData) {
    const evs = data.events.filter(
      (e: Event) => {
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position') ||
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'close_position_reply')
      }
    );

    return combiningEvents(evs)
  }
}

function combiningEvents(evs: Event[]) {
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

