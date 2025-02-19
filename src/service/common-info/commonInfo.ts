import { CustomChainInfo, TokenItemType } from '@oraichain/common'
import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ErrorUtils, ResponseDto } from '../../util'
import { TatumConfig } from '../tatum'
import {
  ApiGetChainInfoRequest,
  ApiGetChainInfosRequest,
  ApiGetTokenInfoRequest,
  ApiGetTokenInfosRequest,
  ChainInfo,
  GetChainInfoParams,
  GetChainInfosParams,
  GetTokenInfoParams,
  GetTokenInfosParams,
  TokenInfo,
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

  async getTokenInfo({ tokenId }: GetTokenInfoParams): Promise<ResponseDto<TokenInfo>> {
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
      } as TokenInfo
    })
  }

  async getTokenInfos({ tokenIds }: GetTokenInfosParams): Promise<ResponseDto<TokenInfo[]>> {
    return ErrorUtils.tryFail(async () => {
      const listTokens: string[] = []
      tokenIds.map((tokenId) => listTokens.push(encodeURIComponent(tokenId)))

      const data = await this.connector.get<TokenItemType[], ApiGetTokenInfosRequest>({
        basePath: `https://oraicommon.oraidex.io/api/v1/tokens/list/${listTokens.join(',')}`,
      })

      const tokenInfos: TokenInfo[] = []
      data.map((tokenInfo) =>
        tokenInfos.push({
          name: tokenInfo.name,
          denom: tokenInfo.denom,
          decimal: tokenInfo.decimals,
          coinGeckoId: tokenInfo.coinGeckoId,
          icon: tokenInfo.icon,
        }),
      )

      return tokenInfos
    })
  }

  async getChainInfo({ chainId }: GetChainInfoParams): Promise<ResponseDto<ChainInfo>> {
    return ErrorUtils.tryFail(async () => {
      const data = await this.connector.get<CustomChainInfo, ApiGetChainInfoRequest>({
        basePath: `https://oraicommon.oraidex.io/api/v1/chains/${chainId}`,
      })

      return {
        id: data.chainId,
        name: data.chainName,
        image: data.chainLogoSvg ? data.chainLogoSvg : data.chainLogoPng,
      } as ChainInfo
    })
  }

  async getChainInfos({ chainIds }: GetChainInfosParams): Promise<ResponseDto<ChainInfo[]>> {
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
            currencies: chainInfo.currencies,
          })
        }
      })

      return chainInfos
    })
  }
}
