import { CosmosRosetta, Network, TatumSDK } from './service'
;(async () => {
  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  await tatumCosmos.bridge.setupQueryClient('https://rpc.orai.io')
  const cosmosBridge = await tatumCosmos.bridge.parseTransferToRemote({
    txHash: '5EE7C328AF892ED0C4CF05A6A9BAD694CFD520AE87DF948003BDC276F4028D99',
  })

  console.log('cosmos bridge: ', cosmosBridge)
})()
