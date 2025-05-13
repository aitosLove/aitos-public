import * as dotenv from "dotenv";
import { swap as swap_on_1inch } from "./1inch_v1";

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
  const precisionFrom = 10 ** fromDecimals;

  console.log(`Swapping ${inputAmount} ${fromName} to ${toName}...`);

  const swapAmount = Math.trunc(inputAmount * precisionFrom);

  // EVM
  await swap_on_1inch({
    src: fromCoinAddress,
    dst: toCoinAddress,
    amount: BigInt(swapAmount),
    slippage: slippage.toString(),
  });

  // APTOS
}
//
