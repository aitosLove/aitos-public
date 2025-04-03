import { ETH, BTC, BNB, CAKE, FOUR } from "./cmc/coin_bsc";
import { CMC_TOKEN_RATE_ANALYSIS } from "./cmc/type";

export const analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] = [
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
