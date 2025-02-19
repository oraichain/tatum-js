import { DefaultParamsType } from '../../../connector'

export interface GetSolanaBridgeFeeParams {
  /**
   * id of token
   */
  tokenId: string
  /**
   * amount of token to bridge
   */
  amount: string
  /**
   * define base path of api
   */
  isMemeApi: boolean
}

export interface SolanaBridgeFee {
  /**
   * amount that actually send
   */
  sendAmount: string
  /**
   * token fee bridge
   */
  tokenFeeAmount: string
  /**
   * relayer fee bridge
   */
  solanaFee: string
}

export interface ApiGetSolanaBridgeFeeRequest extends DefaultParamsType {
  /**
   * bridge direction
   */
  direction: string
  /**
   * token supported
   */
  supportedToken: string
  /**
   * bridge amount
   */
  amount: string
}
