import { Event } from "@cosmjs/stargate";

export interface StakingData {
    sender: string,
    message?: any,
    events: readonly Event[]
}

export interface StakingBondResponse {
    action: string
    stakerAddress: string
    stakingToken: string
    amount: string
}

export interface StakingUnbondResponse {
    
}

export interface StakingWithdrawResponse {

}

export type StakingResponse = StakingBondResponse | StakingUnbondResponse | StakingWithdrawResponse