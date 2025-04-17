import { CMC_TOKEN_RATE_ANALYSIS } from "../cmc/type";
import { ETH, BTC, SUI, DEEP, CETUS, SEND, NS, NAVX } from "../cmc/coin_sui";

export const analysis_portfoli_sui: CMC_TOKEN_RATE_ANALYSIS[] = [
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
