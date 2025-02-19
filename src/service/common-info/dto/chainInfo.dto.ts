import { BridgeAppCurrency } from '@oraichain/common'

import { DefaultParamsType } from '../../../connector'

export interface ChainInfo {
  /**
   * id of chain e.g. Oraichain, 0x01
   */
  id: string
  /**
   * name of chain e.g. Oraichain
   */
  name: string
  /**
   * image of chain
   */
  image?: string
  /**
   * all token chain support
   */
  currencies: BridgeAppCurrency[]
}

export interface GetChainInfoParams {
  /**
   * chain id of chain
   */
  chainId: string
}

export interface ApiGetChainInfoRequest extends DefaultParamsType {}

export interface GetChainInfosParams {
  /**
   * chain id of chain
   */
  chainIds: string[]
}

export interface ApiGetChainInfosRequest extends DefaultParamsType {}
