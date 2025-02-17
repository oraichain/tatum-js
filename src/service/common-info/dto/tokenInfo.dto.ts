import { DefaultParamsType } from '../../../connector'

export interface GetTokenInfoParams {
  /**
   * token id can be token name or token address (cw20)
   */
  tokenId: string
}

export interface TokenInfoResponse {
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

export interface ApiGetTokenInfoRequest extends DefaultParamsType {
  /**
   * token id can be token name or token address (cw20)
   */
  tokenId: string
}
