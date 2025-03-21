import Container, { Service } from "typedi";

import { TatumConnector } from "../../connector";
import { TatumConfig } from "../tatum";
import { CommonInfoCosmos } from "../common-info";
import { CONFIG } from "../../util";

@Service({
    factory: (data: { id: string }) => new OrderbookCosmos(data.id),
    transient: true,
})
export class OrderbookCosmos {
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
    factory: (data: { id: string }) => new OrderbookEvm(data.id),
    transient: true,
})
export class OrderbookEvm {
    private readonly connector: TatumConnector
    private readonly config: TatumConfig
    private commonInfo: CommonInfoCosmos

    constructor(private readonly id: string) {
        this.connector = Container.of(this.id).get(TatumConnector)
        this.config = Container.of(this.id).get(CONFIG)
        this.commonInfo = Container.of(this.id).get(CommonInfoCosmos)
    }
}