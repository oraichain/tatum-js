import { Event } from "@cosmjs/stargate";
import { TokenInfo } from "../common-info";

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
    tokenInfo: TokenInfo
}

export interface StakingUnbondResponse {
    action: string
    stakerAddress: string
    stakingToken: string
    unbondingAmount: string
    unlockTime: string
    tokenInfo: TokenInfo
}

export interface StakingWithdrawResponse {

}

export type StakingResponse = StakingBondResponse | StakingUnbondResponse | StakingWithdrawResponse