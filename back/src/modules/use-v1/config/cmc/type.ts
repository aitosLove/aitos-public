export interface CMC_TOKEN {
  cmcId: string;
  name: string;
  symbol: string;
  introduction: string;
}

export interface CMC_TOKEN_RATE_ANALYSIS {
  assetA: CMC_TOKEN;
  assetB: CMC_TOKEN;
  A_on_B_introduction: string;
}
