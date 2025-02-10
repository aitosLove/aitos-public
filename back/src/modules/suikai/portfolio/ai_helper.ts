import { getProvider, getModel } from "./ai";
import { z } from "zod";
import { generateText, tool } from "ai";
import { adjustToTargetSUIProportion, getHolding, CoinBalance } from "./tool";
import { db } from "@/db";
import { actionStateTable } from "@/db/schema";

const select = "deepseek";
const provider = getProvider({ provider: select });
const model = getModel({ inputModel: "large", provider: select });

export async function adjustPortfolio_by_AI({
  current_holding,
  insight,
}: {
  current_holding: string;
  insight: string;
}) {
  const { text, toolResults } = await generateText({
    model: provider(model),
    toolChoice: "required",
    tools: {
      adjust_portfolio: tool({
        description:
          "This tool is used to adjust the portfolio. You can adjust weight of SUI holding to adjust the portfolio.",
        parameters: z.object({
          thinking: z
            .string()
            .describe(
              "What's your thinking about the portfolio and the adjustment?"
            ),
          sui_weight: z
            .number()
            .max(100)
            .min(0)
            .describe(
              "Which SUI weight you think is the best? It's percentage."
            ),
        }),
        execute: async ({ thinking, sui_weight }) => {
          try {
            console.log(
              `Adjust Portfolio. ${thinking} \n So weight should be set to : ${sui_weight}%`
            );
            adjustToTargetSUIProportion(sui_weight);

            db.insert(actionStateTable)
              .values({
                action: `Set SUI weight to : ${sui_weight}%`,
                reason: thinking,
              })
              .then(() => {
                console.log(`Save portfolio action in DB successfully`);
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
    // maxSteps: 1,
    messages: [
      {
        role: "system",
        content: `You are a professional trader and you have a portfolio on SUI blockchain, which includes SUI, USDC and others. You want to adjust the portfolio to get best profit according to market situation. You main method is to adjust the weight of SUI holding. \n Your current portfolio is ${current_holding}`,
      },
      {
        role: "user",
        content: `The market insight is \n${insight}`,
      },
    ],
  });

  //   console.log(text);
}

async function main() {
  const current_holding = await getHolding();
  adjustPortfolio_by_AI({
    current_holding: JSON.stringify(current_holding.validBalances),
    insight: insight_template,
  });
}

const insight_template = `
Market Insight
22:30:45
Analysis of the Current Market Situation
1. ETH/BTC Ratio:
1h: 0.31%
1d: 0.45%
3d: -3.43%
7d: -11.62%
30d: -30.43%
Interpretation:

The ETH/BTC ratio has been declining significantly over the past month, with a 30-day drop of -30.43%. This suggests that Ethereum's on-chain activity and overall sentiment have weakened relative to Bitcoin.
The short-term (1-hour and 1-day) data show slight positive movements, but these are not enough to counteract the longer-term negative trend.
The 7-day and 30-day declines indicate a broader market sentiment shift, possibly due to macroeconomic factors, regulatory concerns, or specific issues within the Ethereum ecosystem.
2. SUI/ETH Ratio:
1h: -1.32%
1d: 5.89%
3d: -6.66%
7d: 0.74%
30d: 1.35%
Interpretation:

The SUI/ETH ratio shows mixed signals, with a 1-day increase of 5.89% but a 3-day decline of -6.66%. The 30-day change is slightly positive at 1.35%, indicating that Sui has maintained some relative strength compared to Ethereum.
The 1-day increase could be due to recent developments or news in the Sui network, such as new partnerships, protocol upgrades, or increased adoption.
The 30-day positive trend suggests that Sui's ecosystem is growing, albeit slowly, relative to Ethereum. This could be an early sign of Sui gaining traction in the smart contract and DeFi space.
3. SUI/BTC Ratio:
1h: -1.02%
1d: 6.37%
3d: -9.87%
7d: -10.97%
30d: -29.49%
Interpretation:

The SUI/BTC ratio has seen a significant 30-day decline of -29.49%, similar to the ETH/BTC ratio. This indicates that Sui's relative strength compared to Bitcoin has weakened over the past month.
The 1-day increase of 6.37% is a positive signal, but it is overshadowed by the 3-day and 7-day declines.
The 30-day trend suggests that Sui's cross-chain market sentiment is currently weak relative to Bitcoin. This could be due to broader market conditions, lack of major developments, or slower adoption of the Sui network.
Overall Market Sentiment:
The current market situation appears to be bearish, with both Ethereum and Sui showing significant declines relative to Bitcoin over the past month.
The short-term positive movements (1-day and 1-hour) for SUI/ETH and SUI/BTC suggest some temporary relief, but the long-term trends are still negative.
The decline in the ETH/BTC ratio indicates a broader weakening of on-chain activity and sentiment in the Ethereum ecosystem, which may be affecting other altcoins like Sui.
Opinion on SUI:
Short-Term: Sui has shown some resilience with a 1-day increase in both SUI/ETH and SUI/BTC ratios. This could be an opportunity for short-term traders, but caution is advised given the overall market weakness.
Long-Term: The 30-day decline in SUI/BTC and the mixed signals in SUI/ETH suggest that Sui is still in its early stages of development. While there are signs of growth, it faces strong competition from established networks like Ethereum and Bitcoin.
Potential: Sui has the potential to emerge as a strong competitor in the smart contract and DeFi space, but it will need to demonstrate consistent growth, innovation, and adoption to overcome the current market challenges.
Conclusion:
The current market is experiencing a downturn, with both Ethereum and Sui showing weakness relative to Bitcoin.
Sui has shown some positive signals, but it needs to sustain this momentum to gain a stronger foothold in the market.
Investors should remain cautious and consider the broader market conditions before making any significant investments.`;

// main();
