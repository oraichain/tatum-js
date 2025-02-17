import { DefaultParamsType } from '../../../connector'

export interface GetChainInfosParams {
  /**
   * chain id of chain
   */
  chainIds: string[]
}

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
}

export interface ChainInfosResponse {
  chainInfos: ChainInfo[]
}

export interface ApiGetChainInfosRequest extends DefaultParamsType {}
