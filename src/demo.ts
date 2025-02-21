import { CosmosRosetta, Ethereum, Network, TatumSDK } from './service';
import { StargateClient } from '@cosmjs/stargate';
import { OraiSwapAndActionResponse } from './service/amm-v2/swap.dto'
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';

const rpc = "http://3.14.142.99:26657/";

(async () => {
  const client = await StargateClient.connect(rpc);
  const tx = await client.getTx(
    // "B4226C9D4C2872CA2B95A688BE4A04E27BE13B62EFA9D55F735F289717D6BC99"
    "cd7cec3bbc40b695902fc2782076b0b6a3d929e12eac9b6ae70023383d78189c"
  );

  const tatumCosmos = await TatumSDK.init<CosmosRosetta>({ network: Network.COSMOS_ROSETTA })
  // const cosmosSwap = await tatumCosmos.ammV2.parseSwap({ events: tx!.events, message: tx!.tx })
  // console.log(cosmosSwap)
  // console.log("tx", tx)
  const msg = Tx.decode(tx!.tx)
  const rawMsg = MsgExecuteContract.decode(msg.body!.messages[0].value)
  const msgValue = JSON.parse(new TextDecoder().decode(rawMsg.msg))
  console.log(msgValue)
  const action = Object.keys(msgValue)[0]
  // const cosmosSwap = await tatumCosmos.futures.parseFuturesAction({ sender: "", events: tx!.events, message: [msg.body!.messages[1]] })
  // console.log(cosmosSwap)
})()
