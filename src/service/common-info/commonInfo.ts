import { CustomChainInfo, TokenItemType } from '@oraichain/common'
import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ErrorUtils, ResponseDto } from '../../util'
import { TatumConfig } from '../tatum'
import {
  ApiGetChainInfosRequest,
  ApiGetTokenInfoRequest,
  ChainInfo,
  ChainInfosResponse,
  GetChainInfosParams,
  GetTokenInfoParams,
  TokenInfoResponse,
} from './dto'

@Service({
  factory: (data: { id: string }) => new CommonInfoCosmos(data.id),
  transient: true,
})
export class CommonInfoCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
  }

  async getTokenInfo({ tokenId }: GetTokenInfoParams): Promise<ResponseDto<TokenInfoResponse>> {
    return ErrorUtils.tryFail(async () => {
      const encodeUrlToken = encodeURIComponent(tokenId)
      const data = await this.connector.get<TokenItemType, ApiGetTokenInfoRequest>({
        basePath: `https://oraicommon.oraidex.io/api/v1/tokens/${encodeUrlToken}`,
      })

      return {
        name: data.name,
        denom: data.denom,
        decimal: data.decimals,
        coinGeckoId: data.coinGeckoId,
        icon: data.icon,
      } as TokenInfoResponse
    })
  }

  async getChainsInfo({ chainIds }: GetChainInfosParams): Promise<ResponseDto<ChainInfosResponse>> {
    return ErrorUtils.tryFail(async () => {
      const data = await this.connector.get<CustomChainInfo[], ApiGetChainInfosRequest>({
        basePath: 'https://oraicommon.oraidex.io/api/v1/chains',
      })

      const chainInfos: ChainInfo[] = []
      data.map((chainInfo) => {
        if (chainIds.includes(chainInfo.chainId)) {
          chainInfos.push({
            id: chainInfo.chainId,
            name: chainInfo.chainName,
            image: chainInfo.chainLogoSvg ? chainInfo.chainLogoSvg : chainInfo.chainLogoPng,
          })
        }
      })

      return {
        chainInfos,
      } as ChainInfosResponse
    })
  }
}
