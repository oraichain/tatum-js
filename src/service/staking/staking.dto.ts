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
    action: string
    stakerAddress: string
    stakingToken: string
    unbondingAmount: string
    unlockTime: string
}

export interface StakingWithdrawResponse {
    action: string
    address: string
    withdrawToken: string
    withdrawAmount: string
}

export type StakingResponse = StakingBondResponse | StakingUnbondResponse | StakingWithdrawResponse