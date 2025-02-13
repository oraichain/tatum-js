import {
  Account,
  accountFromAny,
  AuthExtension,
  QueryClient,
  setupAuthExtension,
  setupTxExtension,
  TxExtension,
} from '@cosmjs/stargate'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { SimulateResponse } from 'cosmjs-types/cosmos/tx/v1beta1/service'
import { Any } from 'cosmjs-types/google/protobuf/any'
import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'

@Service({
  factory: (data: { id: string }) => new SimulateCosmos(data.id),
  transient: true,
})
export class SimulateCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private queryClient: QueryClient & AuthExtension & TxExtension

  constructor(private readonly id: string) {
    this.config = Container.of(this.id).get(CONFIG)
    this.connector = Container.of(this.id).get(TatumConnector)
  }

  async setupQueryClient(rpcUrl: string) {
    const cometClient = await Tendermint37Client.connect(rpcUrl)

    this.queryClient = QueryClient.withExtensions(cometClient as any, setupTxExtension, setupAuthExtension)
  }

  public async getAccount(searchAddress: string): Promise<Account | null> {
    try {
      const account = await this.queryClient.auth.account(searchAddress)
      return account ? accountFromAny(account) : null
    } catch (error: any) {
      if (/rpc error: code = NotFound/i.test(error.toString())) {
        return null
      }
      throw error
    }
  }

  public async simulate(sender: string, messages: Any[]): Promise<ResponseDto<SimulateResponse>> {
    let returnData: SimulateResponse = {} as any
    let error = undefined
    let status = Status.SUCCESS

    try {
      const accountFromSender = await this.getAccount(sender)
      if (!accountFromSender) {
        throw new Error(`Can not find account with address ${sender}`)
      }

      if (!accountFromSender.pubkey) {
        throw new Error(`Sender ${sender} has null pubkey`)
      }

      const data = await this.queryClient.tx.simulate(
        messages,
        '',
        accountFromSender.pubkey,
        accountFromSender.sequence,
      )!

      returnData = data
    } catch (err: any) {
      error = err
      status = Status.ERROR
    }

    return {
      data: returnData,
      error,
      status,
    }
  }
}
