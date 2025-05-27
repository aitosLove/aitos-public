export interface TokenOnPortfolio {
  // GetHolding
  coinType: string;
  coinName: string;
  coinSymbol: string;
  balance: number;
  balanceUsd: number;
  decimals: number;
  coinPrice: number;
  percentage: number;
}

export interface OnChainCoin {
  coinType: string;
  coinName: string;
  coinSymbol: string; // Symbol

  decimals: number; // 代币的小数位数
  description: string; // 描述
}
