import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service';
import { StargateClient } from '@cosmjs/stargate';
import { OraiSwapAndActionResponse } from './service/amm-v2/swap.dto'
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const rpc = "http://3.14.142.99:26657/";

(async () => {
  const client = await StargateClient.connect(rpc);
  const tx = await client.getTx(
    // "B4226C9D4C2872CA2B95A688BE4A04E27BE13B62EFA9D55F735F289717D6BC99"
    "F27ABB8642F9FBF4EE3B10F7945B667C70330F97EF9EA25BD3507EA52F904299"
  );

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  // const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: tx!.events, message: tx!.tx })
  // console.log(cosmosSwap)
  // console.log("tx", tx)
  const msg = Tx.decode(tx!.tx)
  const cosmosSwap = await tatumCosmos.futures.parseFuturesAction({ sender: "", events: tx!.events, message: msg.body!.messages })
  // console.log(cosmosSwap)
})()
