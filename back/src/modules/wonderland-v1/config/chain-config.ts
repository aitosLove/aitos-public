// import { BSC_CHAIN_CONFIG } from "./bsc/chain";
// import { EVMCoin, USDT } from "./bsc/coin";

// export const CHAIN_CONFIG = BSC_CHAIN_CONFIG;

// export type TOKEN_USE = EVMCoin;

import { APT_CHAIN_CONFIG } from "./apt/chain";
import { APTCoin } from "./apt/coin";

export const CHAIN_CONFIG = APT_CHAIN_CONFIG;
export type TOKEN_USE = APTCoin;
