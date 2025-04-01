import Container, { Service } from "typedi";
import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import { CONFIG } from '../../util';
import { StakingBondResponse, StakingCompoundResponse, StakingData, StakingResponse, StakingUnbondResponse, StakingWithdrawResponse } from "./staking.dto";
import { Attribute, Event } from "@cosmjs/stargate";
import { ORAI_CONTRACT } from "../../server/constant/contractAddress";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { decodeNestedObject, objectToMap, combiningEvents } from "../../util/decode";
import { CommonInfoCosmos } from "../common-info";

@Service({
    factory: (data: { id: string }) => new StakingCosmos(data.id),
    transient: true,
})

export class StakingCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.config = Container.of(id).get(CONFIG)
    this.connector = Container.of(id).get(TatumConnector)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }

  public async parseStakingAction(data: StakingData): Promise<StakingResponse> {
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
        response = await this.parseStakingBond(data)
        break
      case 'unbond':
        response = await this.parseStakingUnbond(data)
        break
      case 'withdraw':
        response = await this.parseStakingWithdraw(data)
        break
      case 'compound':
        response = await this.parseStakingCompound(data)
        break
      default:
        break
    }
    return response
  }

  public async parseStakingBond(data: StakingData): Promise<StakingBondResponse> {
    let response: StakingBondResponse = {} as any
    
    // staking cw20 token only
    const e = combiningEvents(data.events.filter(
      (e: Event) => 
        e.attributes.some((attr) => attr.key === '_contract_address' && attr.value === ORAI_CONTRACT.STAKING) &&
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'bond')
      )
    );

    response.action = 'bond'
    response.stakerAddress = e[0].staker_addr
    response.stakingToken = e[0].staking_token
    response.amount = e[0].amount

    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: e[0].staking_token})).data

    return response
  }

  async parseStakingUnbond(data: StakingData): Promise<StakingUnbondResponse> {
    let response: StakingUnbondResponse = {} as any

    // staking cw20 token only
    const e = combiningEvents(data.events.filter(
      (e: Event) => 
        e.attributes.some((attr) => attr.key === '_contract_address' && attr.value === ORAI_CONTRACT.STAKING) &&
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'unbond')
      )
    );

    response.action = 'unbond'
    response.stakerAddress = e[0].staker_addr[0]
    response.stakingToken = e[0].staking_token[0]
    response.unbondingAmount = e[0].amount[1]
    response.unlockTime = e[0].unlock_time

    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: e[0].staking_token[0]})).data

    return response
  }

  async parseStakingWithdraw(data: StakingData): Promise<StakingWithdrawResponse> {
    let response: StakingWithdrawResponse = {} as any

    const e = combiningEvents(data.events.filter(
      (e: Event) => 
        e.attributes.some((attr) => attr.key === '_contract_address') &&
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'transfer')
      )
    );
    const tokenContractAddress = e[0]._contract_address

    response.action = 'withdraw'
    response.claimer = e[0].to
    response.claimAmount = e[0].amount
    response.tokenInfo = (await this.commonInfo.getTokenInfo({tokenId: tokenContractAddress!})).data

    return response
  }

  async parseStakingCompound(data: StakingData): Promise<StakingCompoundResponse> {
    let response: StakingCompoundResponse = {} as any

    const e = combiningEvents(data.events.filter(
      (e: Event) => 
        e.attributes.some((attr) => attr.key === '_contract_address') &&
        e.attributes.some((attr) => attr.key === 'action' && attr.value === 'compound')
      )
    );

    console.log('e', e)
    

    return response
  }

}
