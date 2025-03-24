import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { CommonInfoCosmos } from '../common-info'
import { TatumConfig } from '../tatum'
import { CreateDenomCosmosData, CreateDenomResponse } from './pool.dto'

@Service({
  factory: (data: { id: string }) => new PoolCosmos(data.id),
  transient: true,
})
export class PoolCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }

  /**
   * Parse Create Denom msg
   */
  async parseCreateDenom(data: CreateDenomCosmosData): Promise<ResponseDto<CreateDenomResponse | null>> {
    let returnData: CreateDenomResponse = {} as any
    let error = null
    let status = Status.SUCCESS

    try {
      const setDenomEvent = data.events.find((event) => event.type === 'set_denom_metadata')
      if (!setDenomEvent) {
        throw new Error('Set Denom Event not found')
      }

      for (const attribute of setDenomEvent.attributes) {
        switch (attribute.key) {
          case 'denom':
            returnData.baseDenom = attribute.value
            break
          case 'denom_metadata':
            const rawMetadata = attribute.value
            returnData.description = rawMetadata.split("description")[1].split(":")[1].split('"')[1]
            returnData.name = rawMetadata.split("name")[1].split('"')[1]
            returnData.symbol = rawMetadata.split("symbol")[1].split('"')[1]
            returnData.exponent = rawMetadata.split("exponent")[1].split(">")[0].split(":")[1].trim()
            break
          default:
            break

        }
      }
    } catch (err: any) {
      error = err
      status = Status.ERROR
    }

    return {
      data: Object.keys(returnData).length === 0 ? null : returnData,
      error,
      status,
    }
  }
}

@Service({
  factory: (data: { id: string }) => new PoolEvm(data.id),
  transient: true,
})
export class PoolEvm {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig
  private commonInfo: CommonInfoCosmos

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
    this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
  }
}
