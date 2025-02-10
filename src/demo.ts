import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service';
import { StargateClient } from '@cosmjs/stargate';
import { OraiSwapAndActionResponse } from './service/amm-v2/swap.dto'

const rpc = "http://3.14.142.99:26657/";

(async () => {
  const client = await StargateClient.connect(rpc);
  const tx = await client.getTx(
    // "B4226C9D4C2872CA2B95A688BE4A04E27BE13B62EFA9D55F735F289717D6BC99"
    "581F294BE43CE5E1113E4778496838E42AC3102B2BDA97648490DD2210BEBF8F"
  );

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  // const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: tx!.events, message: tx!.tx })
  // console.log(cosmosSwap)
  const cosmosSwap = await tatumCosmos.ammV2.parseSwapAndAction({ events: tx!.events, message: tx!.tx })
  console.log(cosmosSwap.data)
})()
