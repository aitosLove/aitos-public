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
