import Container, { Service } from "typedi";
import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import { CONFIG } from '../../util';
import { StakingBondResponse, StakingData, StakingResponse } from "./staking.dto";
import { Event } from "@cosmjs/stargate";
import { ORAI_CONTRACT } from "../../server/constant/contractAddress";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { decodeNestedObject, objectToMap } from "../../util/decode";

@Service({
    factory: (data: { id: string }) => new StakingCosmos(data.id),
    transient: true,
})

export class StakingCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
  }

  public parseStakingAction(data: StakingData): StakingResponse {
    let response: StakingResponse = {} as any
    const evs = data.events.filter(
      (e: Event) => 
        e.type === 'wasm'
        && e.attributes.some((attr) => 
          attr.key === "_contract_address" &&
          attr.value === ORAI_CONTRACT.STAKING
        )
        
    )

    const msg = MsgExecuteContract.decode(data.message[0].value)
    const msgValue = JSON.parse(new TextDecoder().decode(msg.msg))
    const action = Object.keys(msgValue)[0]

    switch(action) {
      case 'send':
        response = this.parseStakingBond(data)
        break
      case 'unbond':
        response = this.parseStakingBond(data)
        break
      case 'withdraw':
        break
      default:
        break
    }
    return response
  }

  public parseStakingBond(data: StakingData): StakingBondResponse {
    let response: StakingBondResponse = {} as any
    
    // staking cw20 token only
    const e = data.events.find(
      (e: Event) => 
        e.type === 'wasm'
        && e.attributes.some((attr) => 
          attr.key === "_contract_address" &&
          attr.value === ORAI_CONTRACT.STAKING
      )
    )!

    response.action = 'bond'
    response.stakerAddress = e.staker_addr


    return response
  }

  parseStakingUnbond(data: StakingData) {

  }

  parseStakingWithdraw(data: StakingData) {

  }

}