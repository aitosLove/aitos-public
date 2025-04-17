import * as dotenv from "dotenv";

import { swap_on_panora } from "./aggragator";
import { account, panoraClient } from "../../config/apt/account";

dotenv.config();

const slippage = 10;

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
  // const precisionFrom = 10 ** fromDecimals;

  // const swapAmount = Math.trunc(inputAmount * precisionFrom);
  // Panora will deal with decimals automatically

  console.log(`Swapping ${inputAmount} ${fromName} to ${toName}...`);

  await swap_on_panora(panoraClient, {
    src: fromCoinAddress as `0x${string}`,
    dst: toCoinAddress as `0x${string}`,
    amount: inputAmount.toString(),
    walletAddress: account.accountAddress.toString(),
    chainId: "1",
    privateKey: account.privateKey.toString(),
    slippagePercentage: slippage.toString(),
  });
}
