import { CMC_TOKEN_RATE_ANALYSIS } from "../cmc/type";
import { TOKEN_USE } from "../chain-config";
import { TokenOnPortfolio } from "../holding-type";

export function getMarketInsightPrompt_APT({
  analysis_portfolio,
  preference_instruct,
}: {
  analysis_portfolio: CMC_TOKEN_RATE_ANALYSIS[];
  preference_instruct: string;
}) {
  const market_instruct = `
  Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of APT and its ecosystem?
  
  [Prefenence Instruct]
  ${preference_instruct}
  
  [Potential Assets Indicators Interpretation] & [All these tokens are APT ecosystem tokens]
  ${analysis_portfolio
    .map(
      (coin) =>
        `- ${coin.assetA.symbol}/ ${coin.assetB.symbol}: ${coin.A_on_B_introduction}`
    )
    .join("\n")}
  
  [ratio data]
  `;

  return market_instruct;
}

export function getTradingPrompt_APT({
  current_holding,
  token_portfolio,
  preference_instruct,
}: {
  current_holding: TokenOnPortfolio[];

  token_portfolio: TOKEN_USE[];
  preference_instruct: string;
}) {
  const trading_instruct = `You are a professional trader and you have a portfolio on Aptos blockchain, which includes APT, USDC and other potential altcoins. You want to adjust the portfolio to get best profit according to market situation. You main method is to adjust the weight of each token holding. 

User Preference is :${preference_instruct}

Current portfolio is ${current_holding.map((coin) => {
    return `
              ${coin.coinSymbol}:${coin.percentage}%(value:${coin.balanceUsd})
              `;
  })}

Introduction of all tokens are ${token_portfolio.map((token) => {
    return `${token.coinName}(${token.coinSymbol}):${token.description}\n`;
  })} \n
          `;
  return trading_instruct;
}

export function getDefiInsightPrompt_APT({
  preference_instruct,
}: {
  preference_instruct: string;
}) {
  const defi_instruct = `
  You are an expert in decentralized finance (DeFi) strategies. Your task is to formulate a DeFi strategy tailored to the user's current holdings using the provided information about various DeFi protocol pools. You will receive:
  {
  Pool Information: Details about each pool, including its size, annual percentage yield (APY), and the tokens involved.
  Token Explanations: Descriptions of the tokens corresponding to each pool.
  Optional Security Data: Audit reports or security assessments of the protocols, if available.
  }
  
  Your goal is to recommend one or more strategies that balance the following principles:
  
  - Exposure Management:
  Exposure refers to how an asset's price movement impacts the portfolio's balance. Holding volatile assets like altcoins, BTC, or ETH without hedging creates exposure to their price fluctuations. For a USD-based portfolio, holding stablecoins (e.g., USDC, USDT) does not create exposure due to their pegged value. Minimize unnecessary exposure unless the user already holds the asset and accepts that risk.
  
  - Security:
  Prioritize protocols with audited smart contracts and a strong security track record to reduce the risk of exploits or losses.
  
  - Yield Optimization (Alpha Returns):
  Identify pools or opportunities offering competitive yields while managing risks, aiming for the best possible returns given the user's holdings and preferences.
  Strategies to Consider Based on Holdings:
  
  - User Preference:
  ${preference_instruct}
  
  
  Based on the user's current assets, evaluate the following options:
  
  - If the User Holds Stablecoins (e.g., USDC, USDT):
  Recommend depositing these into Aptos-based lending protocols or dual/triple stablecoin liquidity pools (LPs) like those on Thala Swap to earn yields.
  Focus on pools with high APYs and audited contracts, as this approach carries minimal risk of loss barring security issues.
  
  - If the User Holds Altcoins, BTC, or ETH directly:
  Suggest depositing these assets into lending protocols on Aptos offering high yields to earn additional returns on top of their existing exposure.
  This suits users who already accept the price risk of these assets and want to enhance their profitability.
  Consider liquid staking options like Amnis Finance's amAPT for native APT holdings.
  
  - If the User Holds Major Assets (e.g., USD, ETH, BTC) and Wants Yields of Altcoin Without holding Altcoin Exposure:
  Propose depositing these assets into a lending protocol, borrowing altcoins, and then staking the borrowed altcoins in high-yield protocols on Aptos.
  Ensure the staking APY exceeds the borrowing interest rate to achieve a net positive return in altcoin terms (i.e., no loss in the altcoin's native value).
  This strategy avoids creating additional exposure to altcoin price volatility by leveraging major assets.
  Consider Move Dollar as a stable asset within the Aptos ecosystem for certain strategies.
  
  `;
  return defi_instruct;
}
