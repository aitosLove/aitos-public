import { NAVISDKClient } from "navi-sdk";
import * as dotenv from "dotenv";
// import { getRoute, swap, SwapOptions } from "navi-aggregator-sdk";

dotenv.config();

const mnemonic = process.env.SUI_WORDS;
const rpc = process.env.RPC;
const client = new NAVISDKClient({
  mnemonic: mnemonic,
  networkType: rpc,
});

const account = client.accounts[0];

const slippage = 10;

const apiKey = undefined;

export async function swap({
  inputAmount,
  fromCoinAddress,
  toCoinAddress,
  fromDecimals,
  fromName,
  toName,
}: {
  inputAmount: number;
  fromCoinAddress: string;
  toCoinAddress: string;
  fromDecimals: number;
  fromName?: string;
  toName?: string;
}) {
  const precisionFrom = 10 ** fromDecimals;

  console.log(`Swapping ${inputAmount} ${fromName} to ${toName}...`);

  const swapAmount = Math.trunc(inputAmount * precisionFrom);

  await swap_on_navi({ fromCoinAddress, toCoinAddress, swapAmount });
}

async function swap_on_navi({
  fromCoinAddress,
  toCoinAddress,
  swapAmount,
}: {
  fromCoinAddress: string;
  toCoinAddress: string;
  swapAmount: number;
}) {
  let minAmountOut;

  const quote = await client.getQuote(
    fromCoinAddress,
    toCoinAddress,
    swapAmount,
    apiKey
  );

  minAmountOut = Number(quote.amount_out) * (1 - slippage / 100);

  // const result = await account.dryRunSwap(
  //   fromCoinAddress,
  //   toCoinAddress,
  //   amount,
  //   minAmountOut,
  //   apiKey
  // );

  const result = await account.swap(
    fromCoinAddress,
    toCoinAddress,
    swapAmount,
    minAmountOut,
    apiKey
    // {
    //   depth: 5,
    // }
  );

  console.log(`Swap is `, result.effects.status);
  // console.log(result.balanceChanges);
}
