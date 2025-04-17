export interface SOLCoin {
  coinType: string; // mint address
  coinName: string;
  coinSymbol: string; // Symbol

  decimals: number; // 代币的小数位数
  description: string; // 描述
}

// 注意：Jupiter 会把 nSOL当成 wSOL处理

export const TRUMP: SOLCoin = {
  coinType: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
  coinName: "OFFICIAL TRUMP",
  coinSymbol: "TRUMP",
  decimals: 9,
  description:
    "OFFICIAL TRUMP TOKEN launched by Donald Trump himself. This is the only official token launched by Donald Trump.",
};

export const wSOL: SOLCoin = {
  coinType: "So11111111111111111111111111111111111111112",
  coinName: "Wrapped SOL",
  coinSymbol: "WSOL",
  decimals: 9,
  description:
    "Wrapped SOL (wSOL) is a tokenized version of SOL that can be used in DeFi applications on the Solana blockchain. It allows users to interact with various DeFi protocols while holding SOL in a wrapped format.",
};

export const nSOL: SOLCoin = {
  coinType: "SOL",
  coinName: "Solana",
  coinSymbol: "SOL",
  decimals: 9,
  description:
    "Native SOL token of Solana blockchain. It is used for transaction fees, staking, and governance within the Solana ecosystem.",
};

export const USDC: SOLCoin = {
  coinType: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  coinName: "USD Coin",
  coinSymbol: "USDC",
  decimals: 6,
  description:
    "USD Coin (USDC) is a stablecoin pegged to the US dollar, widely used in the Solana ecosystem for trading and DeFi applications.",
};

export const JUP: SOLCoin = {
  coinType: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  coinName: "Jupiter",
  coinSymbol: "JUP",
  decimals: 6,
  description:
    "Jupiter is a decentralized exchange (DEX) aggregator on the Solana blockchain, providing users with the best prices for token swaps by routing trades through multiple liquidity sources.",
};

export const RAY: SOLCoin = {
  coinType: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  coinName: "Raydium",
  coinSymbol: "RAY",
  decimals: 6,
  description:
    "Raydium is an automated market maker (AMM) and liquidity provider built on the Solana blockchain, enabling fast and efficient trading and yield farming for users.",
};

export const PYTH: SOLCoin = {
  coinType: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  coinName: "Pyth Network",
  coinSymbol: "PYTH",
  decimals: 6,
  description:
    "Pyth Network is a decentralized oracle solution that provides real-time market data to smart contracts on the Solana blockchain, enabling developers to build data-driven applications.",
};
