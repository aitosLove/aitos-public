import { swap } from "./swap";
import { AptosAccountManager } from "../../chain/apt/account";

export class HyperionSwapKit {
  private slippage: number;
  private accountManager: AptosAccountManager;

  constructor({
    slippage = 1,
    accountManager,
  }: {
    slippage?: number;
    accountManager: AptosAccountManager;
  }) {
    this.slippage = slippage;
    this.accountManager = accountManager;
  }

  async swap({
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
    return await swap({
      inputAmount,
      fromCoinAddress,
      toCoinAddress,
      fromDecimals,
      fromName,
      toName,
      accountManager: this.accountManager,
      slippage: this.slippage,
    });
  }
}
