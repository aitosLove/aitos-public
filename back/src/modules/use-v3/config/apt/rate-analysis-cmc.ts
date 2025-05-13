import { CMC_TOKEN_RATE_ANALYSIS } from "../cmc/type";
import { ETH, BTC, APT, AMI, THL, PROPS } from "../cmc/coin_apt";

export const analysis_portfolio_apt: CMC_TOKEN_RATE_ANALYSIS[] = [
  {
    assetA: ETH,
    assetB: BTC,
    A_on_B_introduction: `Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity.`,
  },
  {
    assetA: APT,
    assetB: BTC,
    A_on_B_introduction: `Cross-chain market sentiment indicator, which reflects the relative strength of the Aptos network in comparison to Bitcoin. A stronger indicator suggests that Aptos's ecosystem is gaining traction or is more active than Bitcoin, especially within its high-throughput blockchain infrastructure and smart contract ecosystem.`,
  },
  {
    assetA: APT,
    assetB: ETH,
    A_on_B_introduction: `Comparative ecosystem growth indicator, which measures the relative development of the Aptos network compared to Ethereum. A stronger indicator indicates that Aptos is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its competitive advantage in scalability and transaction throughput.`,
  },
  {
    assetA: AMI,
    assetB: APT,
    A_on_B_introduction: `Alpha indicator of liquid staking adoption in the Aptos ecosystem. Reflects the popularity and utilization of Amnis Finance's staking solutions (amAPT and stAPT) relative to the native APT token.`,
  },
  {
    assetA: THL,
    assetB: APT,
    A_on_B_introduction: `Beta indicator of DeFi protocol engagement in the Aptos ecosystem. Measures the adoption of Thala's stablecoin (Move Dollar) and DEX (Thala Swap) services relative to the overall Aptos network activity.`,
  },
  {
    assetA: PROPS,
    assetB: APT,
    A_on_B_introduction: `Gamma indicator of real-world asset tokenization on the Aptos blockchain. Reflects the growth of Propbase's real estate tokenization platform relative to the broader Aptos ecosystem.`,
  },
];
