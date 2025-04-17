"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysis_portfolio_apt = void 0;
var coin_apt_1 = require("../cmc/coin_apt");
exports.analysis_portfolio_apt = [
    {
        assetA: coin_apt_1.ETH,
        assetB: coin_apt_1.BTC,
        A_on_B_introduction: "Comprehensive on-chain sentiment indicator, which reflects the overall strength of on-chain activities. A stronger indicator represents a stronger on-chain activity.",
    },
    {
        assetA: coin_apt_1.APT,
        assetB: coin_apt_1.BTC,
        A_on_B_introduction: "Cross-chain market sentiment indicator, which reflects the relative strength of the Aptos network in comparison to Bitcoin. A stronger indicator suggests that Aptos's ecosystem is gaining traction or is more active than Bitcoin, especially within its high-throughput blockchain infrastructure and smart contract ecosystem.",
    },
    {
        assetA: coin_apt_1.APT,
        assetB: coin_apt_1.ETH,
        A_on_B_introduction: "Comparative ecosystem growth indicator, which measures the relative development of the Aptos network compared to Ethereum. A stronger indicator indicates that Aptos is showing better adoption, performance, or growth relative to Ethereum, potentially signaling its competitive advantage in scalability and transaction throughput.",
    },
    {
        assetA: coin_apt_1.AMI,
        assetB: coin_apt_1.APT,
        A_on_B_introduction: "Alpha indicator of liquid staking adoption in the Aptos ecosystem. Reflects the popularity and utilization of Amnis Finance's staking solutions (amAPT and stAPT) relative to the native APT token.",
    },
    {
        assetA: coin_apt_1.THL,
        assetB: coin_apt_1.APT,
        A_on_B_introduction: "Beta indicator of DeFi protocol engagement in the Aptos ecosystem. Measures the adoption of Thala's stablecoin (Move Dollar) and DEX (Thala Swap) services relative to the overall Aptos network activity.",
    },
    {
        assetA: coin_apt_1.PROPS,
        assetB: coin_apt_1.APT,
        A_on_B_introduction: "Gamma indicator of real-world asset tokenization on the Aptos blockchain. Reflects the growth of Propbase's real estate tokenization platform relative to the broader Aptos ecosystem.",
    },
];
