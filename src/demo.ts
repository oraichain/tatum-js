import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service';
import { StargateClient } from '@cosmjs/stargate';
import { OraiSwapAndActionResponse } from './service/amm-v2/swap.dto'
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const rpc = "http://3.14.142.99:26657/";

(async () => {
  const client = await StargateClient.connect(rpc);
  const tx = await client.getTx(
    // "B4226C9D4C2872CA2B95A688BE4A04E27BE13B62EFA9D55F735F289717D6BC99"
    "E1FF77912196190A09F9C7D70BB770C8D46B1D0C07442D572FA8953A9655AFD0"
  );

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  // const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: tx!.events, message: tx!.tx })
  // console.log(cosmosSwap)
  // console.log("tx", tx)
  const msg = Tx.decode(tx!.tx)
  const cosmosSwap = await tatumCosmos.futures.parseFuturesAction({ sender: "", events: tx!.events, message: [msg.body!.messages[1]] })
  console.log(cosmosSwap)
})()
