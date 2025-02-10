import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service';
import { StargateClient } from '@cosmjs/stargate';

const rpc = "http://3.14.142.99:26657/";

(async () => {
  const client = await StargateClient.connect(rpc);
  const tx = await client.getTx(
    "B4226C9D4C2872CA2B95A688BE4A04E27BE13B62EFA9D55F735F289717D6BC99"
  );

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: tx!.events, message: tx?.msgResponses })

  console.log({ cosmosSwap })
})()
