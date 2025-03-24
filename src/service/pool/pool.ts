import Container, { Service } from "typedi";

import { TatumConnector } from "../../connector";
import { CommonInfoCosmos } from "../common-info";
import { TatumConfig } from "../tatum";
import { CONFIG } from "../../util";

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