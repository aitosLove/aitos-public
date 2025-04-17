//  --- Type ---
// Intergrate all types used in this module

import { TokenOnPortfolio as TokenOnPortfolio_v1 } from "./holding-type";

export type TokenOnPortfolio = TokenOnPortfolio_v1;

import {
  CMC_TOKEN as CMC_TOKEN_v1,
  CMC_TOKEN_RATE_ANALYSIS as CMC_TOKEN_RATE_ANALYSIs_v1,
} from "./cmc/type";
export type CMC_TOKEN = CMC_TOKEN_v1;
export type CMC_TOKEN_RATE_ANALYSIS = CMC_TOKEN_RATE_ANALYSIs_v1;

// ---BSC---

import { BSC_CHAIN_CONFIG } from "./bsc/chain";
import { EVMCoin, CAKE, USDT, FOUR, BNB, DAI, ONE_INCH } from "./bsc/coin";
import { analysis_portfolio_bsc } from "./bsc/rate-analysis-cmc";

export const CHAIN_CONFIG = BSC_CHAIN_CONFIG;

export type TOKEN_USE = EVMCoin;

import {
  getDefiInsightPrompt_BSC,
  getMarketInsightPrompt_BSC,
  getTradingPrompt_BSC,
} from "./bsc/prompt_bsc";

export const getDefiInsightPrompt = getDefiInsightPrompt_BSC;
export const getMarketInsightPrompt = getMarketInsightPrompt_BSC;
export const getTradingPrompt = getTradingPrompt_BSC;

export const select_portfolio: EVMCoin[] = [CAKE, USDT, BNB, FOUR, ONE_INCH];

export const STABLE_COIN = USDT;

export const analysis_portfolio = analysis_portfolio_bsc;

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
