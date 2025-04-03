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
// console.log(`Account address: ${account.address}`);

// Example usage:

const SUI = "0x2::sui::SUI";

const USDC =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

const NAVX =
  "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX";
const SEND =
  "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND";

const COIN =
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

const slippage = 10;

// const fromCoinAddress = SUI;
// const toCoinAddress = USDC;
const apiKey = undefined;

const precisionUSDC = 1e6;
const precisionSUI = 1e9;

export async function swap({
  inputAmount,
  type,
}: {
  inputAmount: number;
  type: "SUI->USDC" | "USDC->SUI";
}) {
  console.log(`Swapping ${inputAmount} ${type}...`);
  if (type === "SUI->USDC") {
    const fromCoinAddress = SUI;
    const toCoinAddress = USDC;

    const amount = Math.trunc(inputAmount * precisionSUI);

    // console.log(`Swapping ${amount} ${type}...`);

    await swap_on_navi({ fromCoinAddress, toCoinAddress, amount });
  } else if (type === "USDC->SUI") {
    const fromCoinAddress = USDC;
    const toCoinAddress = SUI;

    const amount = Math.trunc(inputAmount * precisionUSDC);

    // console.log(`Swapping ${amount} ${type}...`);
    //
    await swap_on_navi({ fromCoinAddress, toCoinAddress, amount });
  }
}

async function swap_on_navi({
  fromCoinAddress,
  toCoinAddress,
  amount,
}: {
  fromCoinAddress: string;
  toCoinAddress: string;
  amount: number;
}) {
  let minAmountOut;

  const quote = await client.getQuote(
    fromCoinAddress,
    toCoinAddress,
    amount,
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
    amount,
    minAmountOut,
    apiKey
  );

  console.log(`Swap is `, result.effects.status);
  // console.log(result.balanceChanges);
}
// swap({ inputAmount: 8, type: "SUI->USDC" });
// swap({ inputAmount: 1.2, type: "USDC->SUI" });
