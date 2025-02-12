import { CosmosRosetta, Network, TatumSDK } from '../../service'
import env from '../configs/env'

let oraichainTatum: CosmosRosetta

class WrapTatum {
  static instance: WrapTatum
  oraichainTatum: CosmosRosetta

  constructor() {
    this.setupOraichainTatum()
  }

  setupOraichainTatum() {
    TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
      .then((res) => {
        this.oraichainTatum = res
        this.oraichainTatum.bridge.setupQueryClient(env.rpcUrl)
      })
      .then((_res) => {
        this.oraichainTatum.simulate.setupQueryClient(env.rpcUrl)
      })
      .then((_res) => {
        oraichainTatum = this.oraichainTatum
        console.log('Created Oraichain Tatum Successfully!')
      })
      .catch((err) => {
        throw err
      })
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new WrapTatum()
    }

    return this.instance
  }
}

const instanceTatum = WrapTatum.getInstance()

export { instanceTatum, oraichainTatum }
