import { CMC_TOKEN_RATE_ANALYSIS } from "./cmc/type";

// ---APT---
// import { analysis_portfolio_apt } from "./apt/rate-analysis-cmc";

// export const analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] =
//   analysis_portfolio_apt;

// ---SOL---
import { analysis_portfolio_sol } from "./sol/rate-analysis-cmc";
export const analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[] =
  analysis_portfolio_sol;
