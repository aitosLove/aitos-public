import { CMC_TOKEN_RATE_ANALYSIS } from "../cmc/type";
import { ETH, BTC, SOL, JUP, RAY, PYTH, TRUMP } from "../cmc/coin_sol";

export const analysis_portfolio_sol: CMC_TOKEN_RATE_ANALYSIS[] = [
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
