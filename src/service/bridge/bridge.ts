import { Container, Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG, ResponseDto, Status } from '../../util'
import { TatumConfig } from '../tatum'
import { CosmosTransferToRemoteData, TransferToRemoteResponse } from './bridge.dto'

@Service({
  factory: (data: { id: string }) => new BridgeCosmos(data.id),
  transient: true,
})
export class BridgeCosmos {
  private readonly connector: TatumConnector
  private readonly config: TatumConfig

  constructor(private readonly id: string) {
    this.connector = Container.of(this.id).get(TatumConnector)
    this.config = Container.of(this.id).get(CONFIG)
  }

  /**
   * Parse Transfer To Remote msg
   */
  async parseTransferToRemote(
    data: CosmosTransferToRemoteData,
  ): Promise<ResponseDto<TransferToRemoteResponse>> {
    return {
      data: {},
      error: undefined,
      status: Status.SUCCESS,
    }
  }
}
