import { TokenItemType } from '@oraichain/common'
import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ErrorUtils, ResponseDto } from '../../util'
import { TatumConfig } from '../tatum'
import { ApiGetTokenInfoRequest, GetTokenInfoParams, TokenInfoResponse } from './tokenInfo.dto'

@Service({
  factory: (data: { id: string }) => new TokenInfoCosmos(data.id),
  transient: true,
})
export class TokenInfoCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
  }

  async getTokenInfo({ tokenId }: GetTokenInfoParams): Promise<ResponseDto<TokenInfoResponse>> {
    return ErrorUtils.tryFail(async () => {
      const data = await this.connector.get<TokenItemType, ApiGetTokenInfoRequest>({
        basePath: `https://oraicommon.oraidex.io/api/v1/tokens/${tokenId}`,
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
}
