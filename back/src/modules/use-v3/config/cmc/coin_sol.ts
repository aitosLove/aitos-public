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

export const SOL: CMC_TOKEN = {
  cmcId: "5426",
  name: "Solana",
  symbol: "SOL",
  introduction:
    "Solana is a high-performance blockchain platform designed for decentralized applications and crypto projects. It aims to provide fast transaction speeds and low fees, making it suitable for various use cases, including DeFi and NFTs.",
};

export const TRUMP: CMC_TOKEN = {
  cmcId: "35336",
  name: "OFFICIAL TRUMP",
  symbol: "TRUMP",
  introduction:
    "OFFICIAL TRUMP TOKEN launched by Donald Trump himself. This is the only official token launched by Donald Trump.",
};

export const JUP: CMC_TOKEN = {
  cmcId: "29210",
  name: "Jupiter",
  symbol: "JUP",
  introduction:
    "Jupiter is a decentralized exchange (DEX) aggregator on the Solana blockchain, providing users with the best prices for token swaps by routing trades through multiple liquidity sources.",
};
export const RAY: CMC_TOKEN = {
  cmcId: "8526",
  name: "Raydium",
  symbol: "RAY",
  introduction:
    "Raydium is an automated market maker (AMM) and liquidity provider built on the Solana blockchain, enabling fast and efficient trading and yield farming for users.",
};

export const PYTH: CMC_TOKEN = {
  cmcId: "28177",
  name: "Pyth Network",
  symbol: "PYTH",
  introduction:
    "Pyth Network is a decentralized oracle solution that provides real-time market data to smart contracts on the Solana blockchain, enabling developers to build data-driven applications.",
};

export const sol_template_analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] = [
  {
    assetA: ETH,
    assetB: BTC,
    A_on_B_introduction: `Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity.`,
  },
  {
    assetA: SOL,
    assetB: BTC,
    A_on_B_introduction: `Cross-chain market sentiment indicator, which reflects the relative strength of the Solana network in comparison to Bitcoin. A stronger indicator suggests that Solana’s alpha growth on Web3 and Crypto. BTC as the base will filter out the beta of asset management changed, so SOL/BTC shows that in other fileds, how market expectation changes.`,
  },
  {
    assetA: SOL,
    assetB: ETH,
    A_on_B_introduction: `Layer 1 performance ratio. This metric compares Solana and Ethereum, two prominent smart contract platforms. A rising ratio may suggest that Solana is gaining relative developer interest, user adoption, or transaction volume versus Ethereum, potentially due to its high throughput and lower fees.`,
  },
  {
    assetA: JUP,
    assetB: SOL,
    A_on_B_introduction: `DEX aggregator strength ratio. This metric reflects the adoption and utility of Jupiter within the Solana ecosystem. An increasing ratio may indicate growing demand for decentralized trading routes and liquidity depth, potentially signaling user preference for on-chain execution.`,
  },
  {
    assetA: RAY,
    assetB: SOL,
    A_on_B_introduction: `Liquidity infrastructure signal. This measures the relative strength of Raydium, one of the earliest Solana AMMs. A rising RAY/SOL ratio could imply higher usage of order book-enabled AMMs or an uptick in yield farming interest within Solana.`,
  },
  {
    assetA: PYTH,
    assetB: SOL,
    A_on_B_introduction: `Oracle utility indicator. This ratio evaluates the market valuation of the Pyth Network relative to Solana, reflecting the growing need for reliable real-world data feeds on-chain. Higher values might suggest Pyth's expanding influence across Solana-native DeFi protocols.`,
  },
  {
    assetA: TRUMP,
    assetB: SOL,
    A_on_B_introduction: `Meme premium gauge. This measures speculative altcoin activity within Solana, especially meme tokens. A surge in the TRUMP/SOL ratio may indicate retail-driven sentiment, memecoin season behavior, or capital rotation into high-volatility assets.`,
  },
];
