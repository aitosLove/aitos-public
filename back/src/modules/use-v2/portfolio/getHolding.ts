import * as dotenv from "dotenv";
// import { getHolding_moralis } from "./moralis/holding_moralis";
// import { getHolding_apt } from "./apt/holding_apt";
import { getHolding_sol } from "./sol/holding_sol";

export async function getHolding() {
  return getHolding_sol();
}

export interface BalanceOnScan {
  coinType: string;
  coinName: string | null;
  coinSymbol: string | null;
  balance: number;
  balanceUsd: number | null;
  decimals: number | null;
  coinPrice: number | null;
}
