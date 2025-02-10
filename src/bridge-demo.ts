import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'

const main = async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  await tatumCosmos.bridge.setupQueryClient('https://rpc.orai.io')
  const cosmosBridge = await tatumCosmos.bridge.parseTransferToRemote({
    txHash: '5EE7C328AF892ED0C4CF05A6A9BAD694CFD520AE87DF948003BDC276F4028D99',
  })
  console.log('cosmos bridge: ', cosmosBridge)

  const tatumEvm = await TatumSDK.init<Ethereum>({ network: Network.BINANCE_SMART_CHAIN })
  await tatumEvm.bridge.setupQueryClient('https://binance.llamarpc.com')
  const evmBridge = await tatumEvm.bridge.parseTransferToRemote({
    txHash: '0x916f1ca34518efea3b0d43cdf8335937c68bb2ad3fd90293fc05f4f93955dea0',
  })
  console.log('evm bridge: ', evmBridge)
}

main()
