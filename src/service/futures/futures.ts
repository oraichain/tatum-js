import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import Container from "typedi";
import { CONFIG } from '../../util';
import { FuturesData } from "./futures.dto";
import { Event } from '@cosmjs/stargate'

export class Futures {
  private readonly connector: TatumConnector;
  private readonly config: TatumConfig;

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
  }

  parseFuturesAction(data: FuturesData) {
    const evs = data.events.filter(
      (e: Event) => {
        e.type === 'wasm' && e.attributes.some((attr) => {
          attr.key === "_contract_address" && attr.value === "orai1wrkchuss9wtph4mxrzqksfrulj7hsl89z0048hg8l7hcglse5rxqea2qnr"
        })
      }
    )

    
  }

  parseOpenPosition(data: FuturesData) {
    const evs = data.events.filter(
      (e: Event) =>
        e.type === 'wasm' && e.attributes.some((attr) => attr.key === 'action' && attr.value === 'swap'),
    )
  }
}

