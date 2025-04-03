// export interface Analysis_Coin {
//   name: string;
//   cmcId: string;
//   enabled: boolean;
//   ratioToSui?: string;
//   altcoin: boolean;
// }

// export const analysis_config: Analysis_Coin[] = [
//   {
//     name: "ETH",
//     cmcId: "1027",
//     enabled: true,
//     altcoin: false,
//   },
//   { name: "BTC", cmcId: "1", enabled: true, altcoin: false },

//   { name: "SUI", cmcId: "20947", enabled: true, altcoin: false },
//   {
//     name: "DEEP",
//     cmcId: "33391",
//     ratioToSui:
//       "DEEP/SUI: Alpha indicator of order book DEX adoption in the SUI ecosystem",
//     enabled: true,
//     altcoin: true,
//   },
//   {
//     name: "CETUS",
//     cmcId: "25114",
//     ratioToSui:
//       "CETUS/SUI: Beta indicator of liquidity pool DEX usage in the SUI ecosystem",
//     enabled: true,

//     altcoin: true,
//   },
//   {
//     name: "SEND",
//     cmcId: "34611",
//     ratioToSui:
//       "SEND/SUI: Gamma indicator of lending activity in the SUI ecosystem",
//     enabled: true,
//     altcoin: true,
//   },
//   {
//     name: "NS",
//     cmcId: "32942",
//     ratioToSui:
//       "NS/SUI: Delta indicator of domain service adoption in the SUI ecosystem",
//     enabled: true,
//     altcoin: true,
//   },
//   {
//     name: "NAVX",
//     cmcId: "29296",
//     ratioToSui:
//       "NAVX/SUI: Epsilon indicator of DEX competition in the SUI ecosystem",
//     enabled: true,
//     altcoin: true,
//   },
// ];

export interface CMC_TOKEN {
  cmcId: string;
  name: string;
  symbol: string;
  introduction: string;
}

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
export const SUI: CMC_TOKEN = {
  cmcId: "20947",
  name: "Sui",
  symbol: "SUI",
  introduction:
    "Sui is a layer-1 blockchain designed for high throughput and low latency. It aims to provide a secure and scalable infrastructure for decentralized applications, focusing on user experience and developer accessibility.",
};
export const DEEP: CMC_TOKEN = {
  cmcId: "33391",
  name: "DeepBook Token",
  symbol: "DEEP",
  introduction:
    "DeepBook is a decentralized order book exchange built on the Sui blockchain. It aims to provide a transparent and efficient trading platform for digital assets, leveraging the unique capabilities of the Sui network.",
};
export const CETUS: CMC_TOKEN = {
  cmcId: "25114",
  name: "Cetus Token",
  symbol: "CETUS",
  introduction:
    "Cetus is a decentralized exchange (DEX) and liquidity protocol built on the Sui blockchain. It focuses on providing efficient trading experiences and superior liquidity for users in the DeFi space.",
};
export const SEND: CMC_TOKEN = {
  cmcId: "34611",
  name: "SEND",
  symbol: "SEND",
  introduction:
    "SEND is a token associated with the Sui lending platform, facilitating lending and borrowing activities in the decentralized finance (DeFi) ecosystem. It aims to provide efficient financial services on the Sui network.",
};
export const NAVX: CMC_TOKEN = {
  cmcId: "29296",
  name: "NAVX Token",
  symbol: "NAVX",
  introduction:
    "NAVX is a token associated with the Sui lending platform, facilitating lending and borrowing activities in the decentralized finance (DeFi) ecosystem. It aims to provide efficient financial services on the Sui network.",
};
export const NS: CMC_TOKEN = {
  cmcId: "32942",
  name: "NS",
  symbol: "NS",
  introduction:
    "NS is a token associated with the Sui network, potentially related to domain services or other functionalities within the ecosystem. Its specific use case may vary based on the platform's development.",
};
export const USDC: CMC_TOKEN = {
  cmcId: "3408",
  name: "USD Coin",
  symbol: "USDC",
  introduction:
    "USD Coin (USDC) is a stablecoin pegged to the US dollar, designed for digital transactions and providing a stable value in the cryptocurrency market. It is widely used in various DeFi applications and exchanges.",
};

export interface CMC_TOKEN_RATE_ANALYSIS {
  assetA: CMC_TOKEN;
  assetB: CMC_TOKEN;
  A_on_B_introduction: string;
}

export const analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] = [
  {
    assetA: ETH,
    assetB: BTC,
    A_on_B_introduction: `Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity.`,
  },
  {
    assetA: SUI,
    assetB: BTC,
    A_on_B_introduction: `Cross-chain market sentiment indicator, which reflects the relative strength of the Sui network in comparison to Bitcoin. A stronger indicator suggests that Sui’s ecosystem is gaining traction or is more active than Bitcoin, especially within its decentralized finance or smart contract ecosystem.`,
  },
  {
    assetA: SUI,
    assetB: ETH,
    A_on_B_introduction: `Comparative ecosystem growth indicator, which measures the relative development of the Sui network compared to Ethereum. A stronger indicator indicates that Sui is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its emergence as a new competitor in the smart contract and DeFi space.`,
  },
  {
    assetA: DEEP,
    assetB: SUI,
    A_on_B_introduction: `Alpha indicator of order book DEX adoption in the SUI ecosystem`,
  },
  {
    assetA: CETUS,
    assetB: SUI,
    A_on_B_introduction: `Beta indicator of liquidity pool DEX usage in the SUI ecosystem`,
  },
  {
    assetA: SEND,
    assetB: SUI,
    A_on_B_introduction: `Gamma indicator of lending activity in the SUI ecosystem`,
  },
  {
    assetA: NS,
    assetB: SUI,
    A_on_B_introduction: `Delta indicator of domain service adoption in the SUI ecosystem`,
  },
  {
    assetA: NAVX,
    assetB: SUI,
    A_on_B_introduction: `Epsilon indicator of DEX competition in the SUI ecosystem`,
  },
];
