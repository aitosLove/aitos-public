//  --- Type ---
// Intergrate all types used in this module

// ---BSC---

// import { BSC_CHAIN_CONFIG } from "./bsc/chain";
// import { EVMCoin, CAKE, USDT, FOUR, BNB, DAI, ONE_INCH } from "./bsc/coin";
// import { analysis_portfolio_bsc } from "./bsc/rate-analysis-cmc";

// export const CHAIN_CONFIG = BSC_CHAIN_CONFIG;

// export type TOKEN_USE = EVMCoin;

// import {
//   getDefiInsightPrompt_BSC,
//   getMarketInsightPrompt_BSC,
//   getTradingPrompt_BSC,
// } from "./bsc/prompt_bsc";

// export const getDefiInsightPrompt = getDefiInsightPrompt_BSC;
// export const getMarketInsightPrompt = getMarketInsightPrompt_BSC;
// export const getTradingPrompt = getTradingPrompt_BSC;

// export const select_portfolio: EVMCoin[] = [CAKE, USDT, BNB, FOUR, ONE_INCH];

// export const STABLE_COIN = USDT;

// export const analysis_portfolio = analysis_portfolio_bsc;

// -------APT-------
// import { APT_CHAIN_CONFIG } from "./apt/chain";
// import { APTCoin } from "./apt/coin";

// export const CHAIN_CONFIG = APT_CHAIN_CONFIG;
// export type TOKEN_USE = APTCoin;

// import { analysis_portfolio_apt } from "./apt/rate-analysis-cmc";

// export const analysis_portfolio = analysis_portfolio_apt;

// import {
//   getDefiInsightPrompt_APT,
//   getMarketInsightPrompt_APT,
//   getTradingPrompt_APT,
// } from "./apt/prompt_apt";

// export const getDefiInsightPrompt = getDefiInsightPrompt_APT;
// export const getMarketInsightPrompt = getMarketInsightPrompt_APT;
// export const getTradingPrompt = getTradingPrompt_APT;

// import { APT, USDC, AMI, PROPS, THL } from "./apt/coin";
// export const select_portfolio: APTCoin[] = [APT, USDC, AMI, PROPS, THL];
// export const STABLE_COIN = USDC;

// -------SUI-------

// import {
//   getDefiInsightPrompt_SUI,
//   getMarketInsightPrompt_SUI,
//   getTradingPrompt_SUI,
// } from "./sui/prompt_sui";

// export const getDefiInsightPrompt = getDefiInsightPrompt_SUI;
// export const getMarketInsightPrompt = getMarketInsightPrompt_SUI;
// export const getTradingPrompt = getTradingPrompt_SUI;

// import { SuiCoin } from "./sui/sui_coin";
// export type TOKEN_USE = SuiCoin;

// import { analysis_portfoli_sui } from "./sui/rate-analysis-cmc";
// export const analysis_portfolio = analysis_portfoli_sui;

// import { USDC, SUI_COIN, NAVX, SEND, CETUS, DEEP, NS } from "./sui/sui_coin";
// export const STABLE_COIN = USDC;
// export const select_portfolio: SuiCoin[] = [
//   SUI_COIN,
//   USDC,
//   NAVX,
//   SEND,
//   CETUS,
//   DEEP,
//   NS,
// ];
// import { SUI_CHAIN_CONFIG } from "./sui/chain";
// export const CHAIN_CONFIG = SUI_CHAIN_CONFIG;

// -------SOL-------
import { SOLCoin } from "./sol/coin";
export type TOKEN_USE = SOLCoin;
import { analysis_portfolio_sol } from "./sol/rate-analysis-cmc";
export const analysis_portfolio = analysis_portfolio_sol;
import { getDefiInsightPrompt_SOL } from "./sol/prompt_sol";
import { getMarketInsightPrompt_SOL } from "./sol/prompt_sol";
import { getTradingPrompt_SOL } from "./sol/prompt_sol";
export const getDefiInsightPrompt = getDefiInsightPrompt_SOL;
export const getMarketInsightPrompt = getMarketInsightPrompt_SOL;
export const getTradingPrompt = getTradingPrompt_SOL;
import { nSOL, TRUMP, USDC, JUP, PYTH, RAY } from "./sol/coin";
export const select_portfolio: SOLCoin[] = [TRUMP, nSOL, USDC, JUP, PYTH, RAY];
export const STABLE_COIN = USDC;
