export interface EVMCoin {
  coinType: string; // sui上的唯一地址
  coinName: string; // 名称，一般用不上
  coinSymbol: string; // Symbol，渲染尽量用这个

  decimals: number; // 代币的小数位数
  description: string; // 描述
}

export const CAKE: EVMCoin = {
  coinType: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  coinName: "PancakeSwap",
  coinSymbol: "CAKE",
  decimals: 18,
  description:
    "PancakeSwap is a decentralized exchange (DEX) built on multiple blockchains, primarily BNB Chain and Ethereum, offering trading, staking, and yield farming services.",
};

export const WBNB: EVMCoin = {
  coinType: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  coinName: "Wrapped BNB",
  coinSymbol: "WBNB",
  decimals: 18,
  description:
    "Wrapped BNB (WBNB) is the BEP-20 version of BNB, allowing it to be used in DeFi applications and on various DEXs. It maintains a 1:1 peg with BNB.",
};

export const BNB: EVMCoin = {
  coinType: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  // Native BNB doesn't have address but we usually use this address to represent it
  coinName: "BNB",
  coinSymbol: "BNB",
  decimals: 18,
  description:
    "BNB is the native cryptocurrency of the Binance exchange and Binance Smart Chain (BSC). It is used for transaction fees, trading fee discounts, and various applications within the Binance ecosystem.",
};

export const FOUR: EVMCoin = {
  coinType: "0x5b73a93b4e5e4f1fd27d8b3f8c97d69908b5e284",
  coinName: "Four",
  coinSymbol: "FORM",
  decimals: 18,
  description:
    "Four aims to let users enter a world filled with games and memes. Discover a realm where fun abounds, bridging the gap between entertainment forms.",
};

export const USDT: EVMCoin = {
  coinType: "0x55d398326f99059ff775485246999027b3197955",
  coinName: "Tether",
  coinSymbol: "USDT",
  decimals: 18,
  description:
    "Tether (USDT) is a stablecoin pegged to the US dollar, widely used in the cryptocurrency market for trading and as a stable store of value.",
};

export const ONE_INCH: EVMCoin = {
  coinType: "0x111111111117dc0aa78b770fa6a738034120c302",
  coinName: "1inch Network",
  coinSymbol: "1INCH",
  decimals: 18,
  description:
    "1inch Network is a decentralized exchange aggregator that finds the best prices across multiple DEXs, optimizing trades for users.",
};

export const DAI: EVMCoin = {
  coinType: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
  coinName: "Dai Token",
  coinSymbol: "DAI",
  decimals: 18,
  description:
    "Dai is a stablecoin pegged to the US dollar, created by MakerDAO. It is designed to maintain a stable value through smart contracts and collateralized assets.",
};
