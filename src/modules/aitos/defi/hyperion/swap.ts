import * as dotenv from "dotenv";

import { swap_on_hyperion } from "./core";
import { account, hyperionSdk, aptosClient } from "../../config/apt/account";

dotenv.config();

const slippage = 1;

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
  // no need to deal with decimals

  console.log(`Swapping ${inputAmount} ${fromName} to ${toName}...`);

  await swap_on_hyperion(
    hyperionSdk,
    aptosClient,
    account,

    {
      from: fromCoinAddress,
      to: toCoinAddress,
      amount: inputAmount,
      walletAddress: account.accountAddress.toString(),
      fromDecimals,
      slippagePercentage: slippage,
    }
  );
}
