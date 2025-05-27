import { swap_on_hyperion } from "./core";
// import { account, hyperionSdk, aptosClient } from "../../config/apt/account";
import { AptosAccountManager } from "../../chain/apt/account";

const slippage = 1;

export async function swap({
  inputAmount,
  fromCoinAddress,
  toCoinAddress,
  fromDecimals,
  fromName,
  toName,
  slippage,
  accountManager,
}: {
  inputAmount: number;
  fromCoinAddress: string;
  toCoinAddress: string;
  fromDecimals: number;
  fromName?: string;
  toName?: string;
  slippage?: number; // slippage percentage, default is 1%
  accountManager: AptosAccountManager;
}) {
  // no need to deal with decimals

  console.log(`Swapping ${inputAmount} ${fromName} to ${toName}...`);

  await swap_on_hyperion(
    // hyperionSdk,
    // aptosClient,
    // account,
    accountManager,

    {
      from: fromCoinAddress,
      to: toCoinAddress,
      amount: inputAmount,
      walletAddress: accountManager.account.accountAddress.toString(),
      fromDecimals,
      slippagePercentage: slippage,
    }
  );
}
