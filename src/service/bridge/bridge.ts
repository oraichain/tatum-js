import { Event, QueryClient, TxExtension, setupTxExtension } from '@cosmjs/stargate'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { Interface, JsonRpcProvider } from 'ethers'
import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { CommonInfoCosmos } from '../common-info/commonInfo'
import { TatumConfig } from '../tatum'
import {
  BridgeSolanaResponse,
  BridgeTonData,
  BridgeTonDataResponse,
  CosmosBridgeSolanaData,
  CosmosIbcData,
  CosmosTransferToRemoteData,
  EvmTransferToRemoteData,
  IbcDataResponse,
  TransferToRemoteResponse,
} from './bridge.dto'
import { COSMOS_CHAIN, GravityAbi, SOLANA_SUPPORTED_TOKEN } from './helpers'

@Service({
  factory: (data: { id: string }) => new BridgeCosmos(data.id),
  transient: true,
})
export class BridgeCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private queryClient: QueryClient & TxExtension
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
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
  async parseTransferToRemote(
    data: CosmosTransferToRemoteData,
  ): Promise<ResponseDto<TransferToRemoteResponse>> {
    let returnData: TransferToRemoteResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const wasmEvents: Event[] = []
      const coinSpentEvents: Event[] = []
      let tokenId: string = 'orai'

      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }

        if (event.type === 'coin_spent') {
          coinSpentEvents.push(event)
        }
      }

      if (wasmEvents.length > 1) {
        const tokenWasmEvent = wasmEvents.find((event) => {
          for (const attribute of event.attributes) {
            if (attribute.key === 'action' && attribute.value === 'send') {
              return event
            }
          }

          return undefined
        })

        const factoryTokenEvent = coinSpentEvents.find((event) => {
          for (const atrribute of event.attributes) {
            if (atrribute.key === 'amount' && atrribute.value.split('/').length > 1) {
              return event
            }
          }

          return undefined
        })

        if (tokenWasmEvent) {
          tokenId = tokenWasmEvent.attributes.find((attr) => attr.key === '_contract_address')?.value!
        } else if (factoryTokenEvent) {
          for (const attr of factoryTokenEvent.attributes) {
            if (attr.key === 'amount') {
              const tokenFragment = attr.value.split('/')
              tokenId = `factory/${tokenFragment[1]}/${tokenFragment[2]}`
            }
          }
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
        let remoteDenom: string = ''

        for (const attribute of bridgeWasmEvent.attributes) {
          switch (attribute.key) {
            case 'sender':
              returnData.fromAddress = attribute.value
              break
            case 'receiver':
              returnData.toAddress = attribute.value
              break
            case 'amount':
              returnData.bridgeAmount = attribute.value
              break
            case 'denom':
              remoteDenom = attribute.value.split('/')[2]
              break
            case 'token_fee':
            case 'relayer_fee':
              feeAmount += Number(attribute.value)
              break
            default:
              break
          }
        }

        // TODO: we tmp hardcode here, need to fix later
        const fromChainId = 'Oraichain'
        const toChainId = remoteDenom.startsWith('oraib')
          ? '0x38'
          : remoteDenom.startsWith('eth-mainnet')
          ? '0x01'
          : remoteDenom.startsWith('trontrx')
          ? '0x2b6653dc'
          : 'noble-1'
        const chainInfos = (await this.commonInfo.getChainInfos({ chainIds: [fromChainId, toChainId] })).data
        returnData.fromChain = {
          id: chainInfos[0].id,
          name: chainInfos[0].name,
          image: chainInfos[0].image,
        }
        returnData.toChain = {
          id: chainInfos[1].id,
          name: chainInfos[1].name,
          image: chainInfos[1].image,
        }

        returnData.feeAmount = feeAmount.toString()
        returnData.tokenInfo = (await this.commonInfo.getTokenInfo({ tokenId })).data

        const remoteTokenInfo = chainInfos[1].currencies.find(
          (currency) => currency.coinDenom === returnData.tokenInfo.name,
        )
        returnData.bridgeAmount = Math.floor(
          (Number(returnData.bridgeAmount) / Math.pow(10, remoteTokenInfo?.coinDecimals!)) *
            Math.pow(10, returnData.tokenInfo.decimal),
        ).toString()
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

  /**
   * Parse Solana bridge msg
   */
  async parseSolana(data: CosmosBridgeSolanaData): Promise<ResponseDto<BridgeSolanaResponse>> {
    let returnData: BridgeSolanaResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const rawMsg = MsgSend.decode(data.message[0].value)
      const tokenId = rawMsg.amount[0].denom
      const tokenAmount = rawMsg.amount[0].amount

      // TODO: here we hardcode from chain and to chain
      const chainInfos = (
        await this.commonInfo.getChainInfos({
          chainIds: ['Oraichain', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        })
      ).data

      returnData.fromAddress = rawMsg.fromAddress
      returnData.toAddress = rawMsg.toAddress
      returnData.fromChain = {
        id: chainInfos[0].id,
        name: chainInfos[0].name,
        image: chainInfos[0].image,
      }
      returnData.toChain = {
        id: chainInfos[1].id,
        name: chainInfos[1].name,
        image: chainInfos[1].image,
      }
      returnData.tokenInfo = (await this.commonInfo.getTokenInfo({ tokenId })).data

      const remoteTokenInfo = chainInfos[1].currencies.find(
        (currency) => currency.coinDenom === returnData.tokenInfo.name,
      )

      let apiTokenId: string = remoteTokenInfo?.coinDenom!
      let isMemeApi: boolean = false
      if (!(SOLANA_SUPPORTED_TOKEN as any)[apiTokenId]) {
        apiTokenId = remoteTokenInfo?.contractAddress!
        isMemeApi = true
      }

      const feeData = (
        await this.commonInfo.getSolanaBridgeFee({
          tokenId: isMemeApi ? apiTokenId : apiTokenId.toLowerCase(),
          amount: tokenAmount,
          isMemeApi,
        })
      ).data

      returnData.bridgeAmount = feeData.sendAmount
      returnData.feeAmount = (Number(feeData.solanaFee) + Number(feeData.tokenFeeAmount)).toString()
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

  /**
   * Parse ibc message
   */
  async parseIbc(data: CosmosIbcData): Promise<ResponseDto<IbcDataResponse>> {
    let returnData: IbcDataResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const ibcTransferEvent = data.events.find((event) => event.type === 'ibc_transfer')

      if (ibcTransferEvent) {
        let tokenId: string = ''
        let fromChainId: string = ''
        let toChainId: string = ''

        for (const attribute of ibcTransferEvent.attributes) {
          switch (attribute.key) {
            case 'sender':
              returnData.fromAddress = attribute.value
              break
            case 'receiver':
              returnData.toAddress = attribute.value
              break
            case 'amount':
              returnData.bridgeAmount = attribute.value
              break
            case 'denom':
              tokenId = attribute.value
              break
            default:
              break
          }
        }

        for (const chain in COSMOS_CHAIN) {
          if (returnData.fromAddress.startsWith((COSMOS_CHAIN as any)[chain].prefix)) {
            fromChainId = (COSMOS_CHAIN as any)[chain].chain_id
          }

          if (returnData.toAddress.startsWith((COSMOS_CHAIN as any)[chain].prefix)) {
            toChainId = (COSMOS_CHAIN as any)[chain].chain_id
          }
        }

        const chainInfos = (await this.commonInfo.getChainInfos({ chainIds: [fromChainId, toChainId] })).data
        returnData.fromChain = {
          id: chainInfos[0].id,
          name: chainInfos[0].name,
          image: chainInfos[0].image,
        }
        returnData.toChain = {
          id: chainInfos[1].id,
          name: chainInfos[1].name,
          image: chainInfos[1].image,
        }

        const tokenInfo = chainInfos[0].currencies.find((currency) => currency.coinMinimalDenom === tokenId)
        returnData.tokenInfo = {
          name: tokenInfo?.coinDenom!,
          denom: tokenInfo?.coinMinimalDenom!,
          decimal: tokenInfo?.coinDecimals!,
          coinGeckoId: tokenInfo?.coinGeckoId!,
          icon: tokenInfo?.coinImageUrl!,
        }

        returnData.feeAmount = '0'
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

  /**
   * Parse bridge to ton
   */
  async parseTonBridge(data: BridgeTonData): Promise<ResponseDto<BridgeTonDataResponse>> {
    let returnData: BridgeTonDataResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      let wasmEvents: Event[] = []
      let transferEvents: Event[] = []
      let tokenId: string = ''

      for (const event of data.events) {
        if (event.type === 'wasm') {
          wasmEvents.push(event)
        }

        if (event.type === 'transfer') {
          transferEvents.push(event)
        }
      }

      const sendToTonEvent = wasmEvents.find((event) => {
        for (const attr of event.attributes) {
          if (
            attr.key === '_contract_address' &&
            attr.value === 'orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e'
          ) {
            return event
          }
        }

        return undefined
      })

      const bridgeTokenTransferEvent = transferEvents.find((event) => {
        for (const attr of event.attributes) {
          if (
            attr.key === 'recipient' &&
            attr.value === 'orai159l8l9c5ckhqpuwdfgs9p4v599nqt3cjlfahalmtrhfuncnec2ms5mz60e'
          ) {
            return event
          }
        }

        return undefined
      })

      if (bridgeTokenTransferEvent) {
        for (const attr of bridgeTokenTransferEvent.attributes) {
          if (attr.key === 'amount') {
            const tokenSplit = attr.value.split('/')
            tokenId = tokenSplit.length > 1 ? `factory/${tokenSplit[1]}/${tokenSplit[2]}` : tokenSplit[0]
          }
        }
      }

      if (sendToTonEvent && tokenId !== '') {
        let tokenFee: number = 0

        for (const attr of sendToTonEvent.attributes) {
          switch (attr.key) {
            case 'local_sender':
              returnData.fromAddress = attr.value
              break
            case 'remote_receiver':
              returnData.toAddress = attr.value
              break
            case 'local_amount':
              returnData.bridgeAmount = attr.value
              break
            case 'relayer_fee':
            case 'token_fee':
              tokenFee += Number(attr.value)
              break
            default:
              break
          }
        }

        returnData.feeAmount = tokenFee.toString()

        const chainInfos = (await this.commonInfo.getChainInfos({ chainIds: ['Oraichain', 'ton'] })).data
        returnData.fromChain = {
          id: chainInfos[0].id,
          name: chainInfos[0].name,
          image: chainInfos[0].image,
        }
        returnData.toChain = {
          id: chainInfos[1].id,
          name: chainInfos[1].name,
          image: chainInfos[1].image,
        }

        const tokenInfo = chainInfos[0].currencies.find((currency) => currency.coinMinimalDenom === tokenId)
        returnData.tokenInfo = {
          name: tokenInfo?.coinDenom!,
          denom: tokenInfo?.coinMinimalDenom!,
          decimal: tokenInfo?.coinDecimals!,
          coinGeckoId: tokenInfo?.coinGeckoId!,
          icon: tokenInfo?.coinImageUrl!,
        }
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
