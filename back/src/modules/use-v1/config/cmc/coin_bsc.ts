import { CMC_TOKEN, CMC_TOKEN_RATE_ANALYSIS } from "./type";

export const ETH: CMC_TOKEN = {
  cmcId: "1027",
  name: "Ethereum",
  symbol: "ETH",
  introduction:
    "Ethereum is a decentralized platform that enables developers to build and deploy smart contracts and decentralized applications (dApps). It uses its native cryptocurrency, Ether (ETH), to facilitate transactions and computational services on the network.",
};
export const BTC: CMC_TOKEN = {
  cmcId: "1",
  name: "Bitcoin",
  symbol: "BTC",
  introduction:
    "Bitcoin is the first and most well-known cryptocurrency, created in 2009. It operates on a decentralized network using blockchain technology, allowing peer-to-peer transactions without intermediaries. Bitcoin is often referred to as digital gold due to its limited supply and store of value properties.",
};

export const USDC: CMC_TOKEN = {
  cmcId: "3408",
  name: "USD Coin",
  symbol: "USDC",
  introduction:
    "USD Coin (USDC) is a stablecoin pegged to the US dollar, designed for digital transactions and providing a stable value in the cryptocurrency market. It is widely used in various DeFi applications and exchanges.",
};

export const BNB: CMC_TOKEN = {
  cmcId: "1839",
  name: "BNB",
  symbol: "BNB",
  introduction:
    "BNB is the native cryptocurrency of the Binance exchange and Binance Smart Chain (BSC). It is used for transaction fees, trading fee discounts, and various applications within the Binance ecosystem.",
};
export const CAKE: CMC_TOKEN = {
  cmcId: "7186",
  name: "PancakeSwap",
  symbol: "CAKE",
  introduction:
    "PancakeSwap is a decentralized exchange (DEX) built on the Binance Smart Chain (BSC), allowing users to trade cryptocurrencies, provide liquidity, and earn rewards through yield farming.",
};

export const FOUR: CMC_TOKEN = {
  cmcId: "23635",
  name: "Four",
  symbol: "FORM",
  introduction: `
  Four aims to let users enter a world filled with games and memes. Discover a realm where fun abounds, bridging the gap between entertainment forms.`,
};

export const bsc_template_analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] = [
  {
    assetA: ETH,
    assetB: BTC,
    A_on_B_introduction: `Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity.`,
  },
  {
    assetA: BNB,
    assetB: BTC,
    A_on_B_introduction: `Cross-chain market sentiment indicator, which reflects the relative strength of the BNB network in comparison to Bitcoin. A stronger indicator suggests that BNB’s ecosystem is gaining traction or is more active than Bitcoin, especially within its decentralized finance or smart contract ecosystem.`,
  },
  {
    assetA: BNB,
    assetB: ETH,
    A_on_B_introduction: `Comparative ecosystem growth indicator, which measures the relative development of the BNB network compared to Ethereum. A stronger indicator indicates that BNB is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its emergence as a new competitor in the smart contract and DeFi space.`,
  },
  {
    assetA: CAKE,
    assetB: BNB,
    A_on_B_introduction: `Alpha indicator of order book DEX adoption in the BNB ecosystem`,
  },
  {
    assetA: FOUR,
    assetB: BNB,
    A_on_B_introduction: `Gamma indicator of lending activity in the BNB ecosystem`,
  },
];
