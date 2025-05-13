import * as dotenv from "dotenv";

import { swap_on_jupiter } from "./aggregator";
import { nSOL, wSOL } from "../../config/sol/coin";
dotenv.config();

const slippage = 100; // 1% slippage
// 这个是基点，别的都是百分比
// 以后有时间了再统一

// 注意：Jupiter 会把 nSOL当成 wSOL处理

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
  // 特别处理 nSOL的情况
  // 原则上，我们不认为用户的钱包会常态化储存有 wSOL
  // 因此，wSOL直接跳过，并将 nSOL使用 wSOL的地址进行处理

  if (fromName === wSOL.coinName) {
    throw new Error("wSOL is not supported as the input source");
  }

  if (fromCoinAddress === nSOL.coinType) {
    fromCoinAddress = wSOL.coinType;
  }

  const precisionFrom = 10 ** fromDecimals;

  const swapAmount = Math.trunc(inputAmount * precisionFrom);
  // Panora will deal with decimals automatically

  console.log(`Jupiter: Swapping ${inputAmount} ${fromName} to ${toName}...`);

  await swap_on_jupiter({
    srcCoinType: fromCoinAddress,
    dstCoinType: toCoinAddress,
    amount: swapAmount.toString(),
    slippage: slippage,
  });
}
