import { TatumConnector } from "src/connector"
import { TatumConfig } from "../tatum"
import Container, { Service } from "typedi"
import { CONFIG, ResponseDto, Status } from '../../util'
import { Account, accountFromAny, AuthExtension, BankExtension, QueryClient, setupAuthExtension, setupBankExtension, setupTxExtension, TxExtension } from "@cosmjs/stargate"
import { setupWasmExtension, WasmExtension } from "@cosmjs/cosmwasm-stargate"
import { Tendermint37Client } from "@cosmjs/tendermint-rpc"
import { GetTxResponse, SimulateResponse } from "cosmjs-types/cosmos/tx/v1beta1/service";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { Any } from "cosmjs-types/google/protobuf/any"

@Service({
    factory: (data: { id: string }) => new SimulateCosmos(data.id),
    transient: true,
})
export class SimulateCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private queryClient:
    | (QueryClient & AuthExtension  & TxExtension)
    | undefined;

  constructor(private readonly id: string) {
    this.config = Container.of(this.id).get(CONFIG)
    this.connector = Container.of(this.id).get(TatumConnector)

  }

  async setupQueryClient(rpcUrl: string) {
    const cometClient = await Tendermint37Client.connect(rpcUrl)
  
    this.queryClient = QueryClient.withExtensions(
        cometClient as any,
        setupTxExtension,
        setupAuthExtension,
    )
  }   

public async getAccount(searchAddress: string): Promise<Account | null> {
    try {
      const account = await this.queryClient!.auth.account(searchAddress);
      console.log(account)
      return account ? accountFromAny(account) : null;
    } catch (error: any) {
      if (/rpc error: code = NotFound/i.test(error.toString())) {
        return null;
      }
      throw error;
    }
  }

  public async simulate(sender: string, messages: Any[]): Promise<SimulateResponse> {   
    const accountFromSender = (await this.getAccount(sender))!

    return this.queryClient?.tx.simulate(
        messages,
        undefined,
        accountFromSender.pubkey!,
        accountFromSender.sequence,
    )!
  }
}