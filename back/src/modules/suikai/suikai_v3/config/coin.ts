export interface Analysis_Coin {
  name: string;
  cmcId: string;
  enabled: boolean;
  ratioToSui?: string;
  altcoin: boolean;
}

export const analysis_config: Analysis_Coin[] = [
  {
    name: "ETH",
    cmcId: "1027",
    enabled: true,
    altcoin: false,
  },
  { name: "BTC", cmcId: "1", enabled: true, altcoin: false },

  { name: "SUI", cmcId: "20947", enabled: true, altcoin: false },
  {
    name: "DEEP",
    cmcId: "33391",
    ratioToSui:
      "DEEP/SUI: Alpha indicator of order book DEX adoption in the SUI ecosystem",
    enabled: true,
    altcoin: true,
  },
  {
    name: "CETUS",
    cmcId: "25114",
    ratioToSui:
      "CETUS/SUI: Beta indicator of liquidity pool DEX usage in the SUI ecosystem",
    enabled: true,

    altcoin: true,
  },
  {
    name: "SEND",
    cmcId: "34611",
    ratioToSui:
      "SEND/SUI: Gamma indicator of lending activity in the SUI ecosystem",
    enabled: true,
    altcoin: true,
  },
  {
    name: "NS",
    cmcId: "32942",
    ratioToSui:
      "NS/SUI: Delta indicator of domain service adoption in the SUI ecosystem",
    enabled: true,
    altcoin: true,
  },
  {
    name: "NAVX",
    cmcId: "29296",
    ratioToSui:
      "NAVX/SUI: Epsilon indicator of DEX competition in the SUI ecosystem",
    enabled: true,
    altcoin: true,
  },
];

export interface SuiCoin {
  coinType: string; // sui上的唯一地址
  coinName: string; // 名称，一般用不上
  coinSymbol: string; // Symbol，渲染尽量用这个

  decimals: number; // 代币的小数位数
  description: string; // 描述
}

export const SUI_COIN: SuiCoin = {
  coinType: "0x2::sui::SUI",
  coinName: "Sui",
  coinSymbol: "SUI",
  decimals: 9,
  description: "Main Coin on Sui Chain",
};

export const USDC: SuiCoin = {
  coinType:
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  coinName: "USD Coin",
  coinSymbol: "USDC",
  decimals: 6,
  description: "Official USDC launched on Sui Chain. Stable Coin.",
};

export const NAVX: SuiCoin = {
  coinType:
    "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX",
  coinName: "NAVX Token",
  coinSymbol: "NAVX",
  decimals: 9,
  description:
    "Suilend is a lending platform operating on the Sui network. It facilitates lending and borrowing activities in the decentralized finance (DeFi) space, allowing users to borrow and lend digital assets in a trustless and permissionless manner. Suilend aims to provide efficient and accessible financial services to users on the Sui network, contributing to the growth and development of decentralized finance.",
};

export const SEND: SuiCoin = {
  coinType:
    "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND",
  coinName: "SEND",
  coinSymbol: "SEND",
  decimals: 6,
  description:
    "Suilend is a lending platform operating on the Sui network. It facilitates lending and borrowing activities in the decentralized finance (DeFi) space, allowing users to borrow and lend digital assets in a trustless and permissionless manner. Suilend aims to provide efficient and accessible financial services to users on the Sui network, contributing to the growth and development of decentralized finance.",
};
export const DEEP: SuiCoin = {
  coinType:
    "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  coinName: "DeepBook Token",
  coinSymbol: "DEEP",
  decimals: 6,
  description:
    "The preeminent decentralized venue for wholesale liquidity in Web3, only on Sui Network.",
};

export const CETUS: SuiCoin = {
  coinType:
    "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",

  coinName: "Cetus Token",
  coinSymbol: "CETUS",
  decimals: 9,
  description:
    "Cetus is a pioneer DEX and concentrated liquidity protocol built on the Sui and Aptos blockchain. The mission of Cetus is building a powerful and flexible underlying liquidity network to make trading easier for any users and assets. It focuses on delivering the best trading experience and superior liquidity efficiency to DeFi users through the process of building its concentrated liquidity protocol and a series of affiliate interoperable functional modules.",
};

export const NS: SuiCoin = {
  coinType:
    "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
  coinName: "SuiNS Token",
  coinSymbol: "NS",
  decimals: 6,
  description:
    "The Sui Name Service supports username standards common across the web. Interacting on-chain just got a whole lot easier.",
};

export const token_portfolio: SuiCoin[] = [
  SUI_COIN,
  USDC,
  NAVX,
  SEND,
  DEEP,
  CETUS,
  NS,
];
