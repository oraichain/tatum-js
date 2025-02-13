import { Event, QueryClient, TxExtension, setupTxExtension } from '@cosmjs/stargate'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { Interface, JsonRpcProvider } from 'ethers'
import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'
import { CosmosTransferToRemoteData, EvmTransferToRemoteData, TransferToRemoteResponse } from './bridge.dto'
import { GravityAbi } from './helpers'

@Service({
  factory: (data: { id: string }) => new BridgeCosmos(data.id),
  transient: true,
})
export class BridgeCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private queryClient: QueryClient & TxExtension

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
  }

  /**
   * set up query client
   * @param rpcUrl
   */
  async setupQueryClient(rpcUrl: string) {
    const cometClient = await Tendermint37Client.connect(rpcUrl)

    this.queryClient = QueryClient.withExtensions(cometClient, setupTxExtension)
  }

  /**
   * Parse Transfer To Remote msg
   */
  parseTransferToRemote(data: CosmosTransferToRemoteData): ResponseDto<TransferToRemoteResponse> {
    let returnData: TransferToRemoteResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []

      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }
      }

      const bridgeWasmEvent = wasmEvents.find((event) => {
        for (const attribute of event.attributes) {
          if (
            attribute.key === '_contract_address' &&
            attribute.value === 'orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm'
          ) {
            return event
          }
        }

        return undefined
      })

      if (bridgeWasmEvent) {
        let feeAmount: number = 0

        for (const attribute of bridgeWasmEvent.attributes) {
          switch (attribute.key) {
            case 'sender':
              console.log(attribute.value)
              returnData.fromAddress = attribute.value
              break
            case 'receiver':
              returnData.toAddress = attribute.value
              break
            case 'amount':
              returnData.bridgeAmount = attribute.value
              break
            case 'token_fee':
            case 'relayer_fee':
              feeAmount += Number(attribute.value)
              break
            default:
              break
          }
        }

        returnData.feeAmount = feeAmount.toString()
      }
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

@Service({
  factory: (data: { id: string }) => new BridgeEvm(data.id),
  transient: true,
})
export class BridgeEvm {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private queryClient: JsonRpcProvider

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
  }

  /**
   * set up query client
   * @param rpcUrl
   */
  async setupQueryClient(rpcUrl: string) {
    this.queryClient = new JsonRpcProvider(rpcUrl)
  }

  /**
   * Parse Transfer To Remote msg
   */
  async parseTransferToRemote(data: EvmTransferToRemoteData): Promise<ResponseDto<TransferToRemoteResponse>> {
    let returnData: TransferToRemoteResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const gravityInterface = new Interface(GravityAbi)
      const txRes = await this.queryClient.getTransaction(data.txHash)
      if (txRes) {
        const decodedData = gravityInterface.parseTransaction({ data: txRes.data })

        returnData.fromAddress = txRes.from
        returnData.toAddress = txRes.to!
        returnData.bridgeAmount = decodedData?.args[2]
      }
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
