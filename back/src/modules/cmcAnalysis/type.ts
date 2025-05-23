export interface CMC_TOKEN {
  cmcId: string;
  name: string;
  symbol: string;
  introduction: string;
}

export interface RateAnalysis {
  assetA: CMC_TOKEN;
  assetB: CMC_TOKEN;
  A_on_B_introduction: string;
}
