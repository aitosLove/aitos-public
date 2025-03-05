import { getProvider, getModel } from "@/utils/ai";
import { z } from "zod";
import { generateText, tool } from "ai";
import { db } from "@/db";
import { actionStateTable } from "@/db/schema";
import { getHolding, TokenOnTargetPortfolio, adjustPortfolio } from "./core";
import {
  SUI_COIN,
  USDC,
  NAVX,
  SEND,
  DEEP,
  CETUS,
  NS,
  SuiCoin,
} from "../config/coin";
const select = "qwen";
const provider = getProvider({ provider: select });
const model = getModel({ inputModel: "large", provider: select });

// 没探索出好的生成器方案，只能手写了
const token_portfolio: SuiCoin[] = [
  SUI_COIN,
  USDC,
  NAVX,
  SEND,
  DEEP,
  CETUS,
  NS,
];

const portfolioParams = z.object({
  thinking: z.string().describe("The reason for the portfolio adjustment"),
  sui_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of SUI holding in the portfolio"),
  usdc_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of USDC holding in the portfolio"),
  navx_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of NAVX holding in the portfolio"),
  send_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of SEND holding in the portfolio"),
  deep_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of DEEP holding in the portfolio"),
  cetus_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of CETUS holding in the portfolio"),
  ns_weight: z
    .number()
    .min(0)
    .max(100)
    .describe("The weight of SuiNS holding in the portfolio"),
});

export async function adjustPortfolio_by_AI({
  current_holding,
  insight,
}: {
  current_holding: string;
  insight: string;
}) {
  try {
    const { text, toolResults } = await generateText({
      model: provider(model),
      toolChoice: "required",
      tools: {
        adjust_portfolio: tool({
          description:
            "This tool is used to adjust the portfolio. You can adjust weight of SUI holding to adjust the portfolio. Notice that the sum of all weights should be 100.",
          parameters: portfolioParams,
          // parameters: z.object({
          //   thinking: z.string().optional(),
          //   sui_weight: z.number().optional(),
          // }),
          execute: async ({
            thinking,
            sui_weight,
            usdc_weight,
            navx_weight,
            cetus_weight,
            ns_weight,
            deep_weight,
            send_weight,
          }) => {
            try {
              console.log(`Adjust portfolio`);

              const target_portfolio: TokenOnTargetPortfolio[] = [
                {
                  coinType: SUI_COIN.coinType,
                  targetPercentage: sui_weight,
                },
                {
                  coinType: USDC.coinType,
                  targetPercentage: usdc_weight,
                },
                {
                  coinType: NAVX.coinType,
                  targetPercentage: navx_weight,
                },
                {
                  coinType: SEND.coinType,
                  targetPercentage: send_weight,
                },
                {
                  coinType: DEEP.coinType,
                  targetPercentage: deep_weight,
                },
                {
                  coinType: CETUS.coinType,
                  targetPercentage: cetus_weight,
                },
                {
                  coinType: NS.coinType,
                  targetPercentage: ns_weight,
                },
              ];

              console.log(`Thinking:`, thinking);
              console.log(`Target portfolio:`, target_portfolio);

              adjustPortfolio({ targetPortfolio: target_portfolio })
                .then(() => {
                  db.insert(actionStateTable)
                    .values({
                      action: `adjust_portfolio: ${target_portfolio.map(
                        (token) => {
                          const parts = token.coinType.split("::");
                          const tokenName = parts[parts.length - 1];
                          return `${tokenName}:${token.targetPercentage}%\n`;
                        }
                      )}`,
                      reason: thinking,
                    })
                    .then(() => {
                      console.log(`Save portfolio action in DB successfully`);
                    });
                })
                .catch((e) => {
                  console.log(`Error in adjustToTargetSUIProportion`);
                  console.log(e);
                });

              return {
                status: "success",
                target: sui_weight,
              };
            } catch (e) {
              console.log("Error in adjust_portfolio tool");
              console.log(e);
            }
          },
        }),
      },

      maxSteps: 1,
      messages: [
        {
          role: "system",
          content: `You are a professional trader and you have a portfolio on SUI blockchain, which includes SUI, USDC and other potential altcoins. You want to adjust the portfolio to get best profit according to market situation. You main method is to adjust the weight of each token holding. \n Introduction of all tokens are ${token_portfolio.map(
            (token) => {
              return `${token.coinName}(${token.coinSymbol}):${token.description}\n`;
            }
          )} \nYour current portfolio is ${current_holding}.`,
        },
        {
          role: "user",
          content: `The market insight is \n${insight}`,
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
}

async function test() {
  const current_holding = await getHolding();
  adjustPortfolio_by_AI({
    current_holding: JSON.stringify(current_holding.validPortfolio),
    insight: insight_template,
  });
}

// test();

const insight_template = `
### **Market Analysis & SUI Ecosystem Outlook**#### **1. Macro Market Sentiment (ETH/BTC)**- **Key Trend**: ETH/BTC has plummeted **-27.71% over 30 days**, signaling **extreme weakness in Ethereum’s on-chain activity** relative to Bitcoin. This aligns with broader market trends where Bitcoin dominance rises due to macro uncertainty (e.g., Fed policy, ETF inflows) and altcoins struggle.- **Short-Term**: ETH/BTC is down **-7.23% over 7 days**, suggesting **persistent bearish sentiment** toward Ethereum and smart contract platforms. Investors may be rotating into Bitcoin as a "safe haven" or trimming altcoin exposure.---#### **2. SUI’s Relative Performance**- **SUI/ETH**: Up **+3.62% over 30 days**, indicating **SUI is outperforming Ethereum** despite ETH’s broader decline. This suggests growing interest in SUI’s ecosystem as a potential competitor in DeFi/smart contracts.- **SUI/BTC**: Down **-25.09% over 30 days** but less severe than ETH/BTC’s drop. SUI is still underperforming Bitcoin, but its **1d (+3.98%) and 1h (+0.35%) gains** hint at **short-term momentum**.- **Takeaway**: SUI is gaining ground against ETH but remains vulnerable to Bitcoin’s dominance. Its ability to decouple from ETH’s weakness is a **bullish signal for its ecosystem**.---#### **3. SUI Ecosystem Deep Dive**The ecosystem tokens show **diverging trends**, highlighting areas of strength and weakness:| **Token** | **30d Trend** | **Key Insight** ||-----------|---------------|-----------------|| DEEP/SUI  | **+99.59%**   | Explosive growth in **order book DEX adoption** (e.g., DeepBook). Likely driven by incentives, liquidity mining, or unique features. || NS/SUI    | **+12.07%**   | Rising demand for **domain services** (e.g., naming systems), signaling organic ecosystem growth. || CETUS/SUI | **-41.60%**   | Sharp decline in **liquidity pool DEX activity**, possibly due to competition (e.g., NAVX, DEEP) or yield fatigue. || SEND/SUI  | **-21.96%**   | Weakness in **lending activity**, suggesting low demand for leverage or risk-off behavior. || NAVX/SUI  | **-5.21%**    | Mixed signals: 3d surge (+11.46%) but 30d decline. May reflect volatility in **DEX competition**. |---#### **4. Key Takeaways**- **SUI’s Strengths**:   - **Order book DEXs (DEEP)** and **domain services (NS)** are thriving, indicating niche adoption and developer traction.  - **Relative resilience vs. ETH** suggests SUI is carving a niche as a high-performance Layer 1 (e.g., Move language, parallel execution).- **Risks**:   - **Macro headwinds**: Bitcoin dominance and ETH’s weakness could limit upside.  - **Ecosystem fragmentation**: CETUS and SEND declines highlight challenges in liquidity and lending, critical for DeFi sustainability.---#### **5. Strategic Outlook**- **Bull Case**: If SUI sustains momentum in DEXs (DEEP) and infrastructure (NS), it could attract developers and users fleeing Ethereum’s high fees or congestion. A BTC stabilization or ETH rebound would amplify gains.- **Bear Case**: Prolonged BTC dominance or ecosystem stagnation (e.g., CETUS/SEND failing to recover) could trigger further selloffs. SUI remains a high-beta play on altcoin sentiment.**Actionable Insight**: Accumulate SUI on dips if DEEP/SUI and NS/SUI trends hold. Monitor CETUS and SEND for signs of recovery (critical for DeFi flywheel). Hedge against BTC dominance via Bitcoin exposure.`;
