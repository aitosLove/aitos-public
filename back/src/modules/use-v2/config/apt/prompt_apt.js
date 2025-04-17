"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketInsightPrompt_APT = getMarketInsightPrompt_APT;
exports.getTradingPrompt_APT = getTradingPrompt_APT;
exports.getDefiInsightPrompt_APT = getDefiInsightPrompt_APT;
function getMarketInsightPrompt_APT(_a) {
    var analysis_portfolio = _a.analysis_portfolio, preference_instruct = _a.preference_instruct;
    var market_instruct = "\n  Here are a few crypto asset ratio data for one month. Please analyze it. What do you think of the current market situation? And what's your opinion of APT and its ecosystem?\n  \n  [Prefenence Instruct]\n  ".concat(preference_instruct, "\n  \n  [Potential Assets Indicators Interpretation] & [All these tokens are APT ecosystem tokens]\n  ").concat(analysis_portfolio
        .map(function (coin) {
        return "- ".concat(coin.assetA.symbol, "/ ").concat(coin.assetB.symbol, ": ").concat(coin.A_on_B_introduction);
    })
        .join("\n"), "\n  \n  [ratio data]\n  ");
    return market_instruct;
}
function getTradingPrompt_APT(_a) {
    var current_holding = _a.current_holding, token_portfolio = _a.token_portfolio, preference_instruct = _a.preference_instruct;
    var trading_instruct = "You are a professional trader and you have a portfolio on Aptos blockchain, which includes APT, USDC and other potential altcoins. You want to adjust the portfolio to get best profit according to market situation. You main method is to adjust the weight of each token holding. \n\nUser Preference is :".concat(preference_instruct, "\n\nCurrent portfolio is ").concat(current_holding.map(function (coin) {
        return "\n              ".concat(coin.coinSymbol, ":").concat(coin.percentage, "%(value:").concat(coin.balanceUsd, ")\n              ");
    }), "\n\nIntroduction of all tokens are ").concat(token_portfolio.map(function (token) {
        return "".concat(token.coinName, "(").concat(token.coinSymbol, "):").concat(token.description, "\n");
    }), " \n\n          ");
    return trading_instruct;
}
function getDefiInsightPrompt_APT(_a) {
    var preference_instruct = _a.preference_instruct;
    var defi_instruct = "\n  You are an expert in decentralized finance (DeFi) strategies. Your task is to formulate a DeFi strategy tailored to the user's current holdings using the provided information about various DeFi protocol pools. You will receive:\n  {\n  Pool Information: Details about each pool, including its size, annual percentage yield (APY), and the tokens involved.\n  Token Explanations: Descriptions of the tokens corresponding to each pool.\n  Optional Security Data: Audit reports or security assessments of the protocols, if available.\n  }\n  \n  Your goal is to recommend one or more strategies that balance the following principles:\n  \n  - Exposure Management:\n  Exposure refers to how an asset's price movement impacts the portfolio's balance. Holding volatile assets like altcoins, BTC, or ETH without hedging creates exposure to their price fluctuations. For a USD-based portfolio, holding stablecoins (e.g., USDC, USDT) does not create exposure due to their pegged value. Minimize unnecessary exposure unless the user already holds the asset and accepts that risk.\n  \n  - Security:\n  Prioritize protocols with audited smart contracts and a strong security track record to reduce the risk of exploits or losses.\n  \n  - Yield Optimization (Alpha Returns):\n  Identify pools or opportunities offering competitive yields while managing risks, aiming for the best possible returns given the user's holdings and preferences.\n  Strategies to Consider Based on Holdings:\n  \n  - User Preference:\n  ".concat(preference_instruct, "\n  \n  \n  Based on the user's current assets, evaluate the following options:\n  \n  - If the User Holds Stablecoins (e.g., USDC, USDT):\n  Recommend depositing these into Aptos-based lending protocols or dual/triple stablecoin liquidity pools (LPs) like those on Thala Swap to earn yields.\n  Focus on pools with high APYs and audited contracts, as this approach carries minimal risk of loss barring security issues.\n  \n  - If the User Holds Altcoins, BTC, or ETH directly:\n  Suggest depositing these assets into lending protocols on Aptos offering high yields to earn additional returns on top of their existing exposure.\n  This suits users who already accept the price risk of these assets and want to enhance their profitability.\n  Consider liquid staking options like Amnis Finance's amAPT for native APT holdings.\n  \n  - If the User Holds Major Assets (e.g., USD, ETH, BTC) and Wants Yields of Altcoin Without holding Altcoin Exposure:\n  Propose depositing these assets into a lending protocol, borrowing altcoins, and then staking the borrowed altcoins in high-yield protocols on Aptos.\n  Ensure the staking APY exceeds the borrowing interest rate to achieve a net positive return in altcoin terms (i.e., no loss in the altcoin's native value).\n  This strategy avoids creating additional exposure to altcoin price volatility by leveraging major assets.\n  Consider Move Dollar as a stable asset within the Aptos ecosystem for certain strategies.\n  \n  ");
    return defi_instruct;
}
