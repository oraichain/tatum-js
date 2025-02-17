import { DefaultParamsType } from '../../../connector'

export interface GetTokenInfoParams {
  /**
   * token id can be token name or token address (cw20)
   */
  tokenId: string
}

export interface TokenInfo {
  /**
   * name of the token
   */
  name: string
  /**
   * denom of the token
   */
  denom: string
  /**
   * token deciaml (present number of zero)
   */
  decimal: number
  /**
   * coin gecko id of token
   */
  coinGeckoId: string
  /**
   * icon of token
   */
  icon: string
}

export interface ApiGetTokenInfoRequest extends DefaultParamsType {}

export interface GetTokenInfosParams {
  /**
   * token id can be token name or token address (cw20)
   */
  tokenIds: string[]
}

export interface ApiGetTokenInfosRequest extends DefaultParamsType {}
