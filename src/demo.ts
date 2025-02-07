import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service'
;(async () => {
  const tatumEvm = await TatumSDK.init<Ethereum>({ network: Network.ETHEREUM })
  const swap = await tatumEvm.ammV2.parseSwap({ evmMessage: '' })

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: [], message: '' })

  console.log({ swap, cosmosSwap })
})()
