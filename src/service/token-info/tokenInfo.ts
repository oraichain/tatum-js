import Container, { Service } from 'typedi'

import { TatumConnector } from '../../connector'
import { CONFIG } from '../../util'
import { TatumConfig } from '../tatum'

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
}
