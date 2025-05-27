import { getProvider, getModel } from "@/utils/ai";
import { z } from "zod";
import { generateText, tool } from "ai";
import { db } from "@/db";
import { actionStateTable } from "@/db/schema/moduleSchema/defiSchema";
import { TokenOnTarget, executeAdjustment } from "./makeAdjust";
import { OnChainCoin, TokenOnPortfolio } from "../type";
import { getNewestTradingInstruct } from "../prompt";

const select = "qwen";
const provider = getProvider({ provider: select });
const model = getModel({ inputModel: "large", provider: select });

// 动态生成 portfolioParams Schema
function createPortfolioSchema(tokens: OnChainCoin[]) {
  // 初始化一个对象用于存储所有字段定义
  const schemaFields: Record<string, z.ZodTypeAny> = {
    thinking: z.string().describe("The reason for the portfolio adjustment"),
  };

  // 遍历所有代币，为每个代币创建一个权重字段
  tokens.forEach((token) => {
    // 从coinSymbol生成字段名，转为小写，例如 "SUI" -> "sui_weight"
    const fieldName = `${token.coinSymbol.toLowerCase()}_weight`;

    // 创建该字段的 Zod 验证规则
    schemaFields[fieldName] = z
      .number()
      .min(0)
      .max(100)
      .describe(`The weight of ${token.coinSymbol} holding in the portfolio`);
  });

  // 返回完整的 Zod 对象模式
  return z.object(schemaFields);
}

// // 使用函数创建 portfolioParams
// const portfolioParams = createPortfolioSchema(tokenSelected);

// 类型安全的从结果中提取权重值
function extractWeightsFromResult({
  originalResult,
  tokenSelected,
}: {
  // result: z.infer<typeof portfolioParams>;
  originalResult: Record<string, any>;
  tokenSelected: OnChainCoin[];
}): TokenOnTarget[] {
  const portfolioParams = createPortfolioSchema(tokenSelected);

  // 使用动态生成的 schema 验证结果
  const parsedResult = portfolioParams.safeParse(originalResult);
  if (!parsedResult.success) {
    console.error("Invalid portfolio result:", parsedResult.error);
    throw new Error("Invalid portfolio result");
  }
  // 如果验证成功，提取权重值

  const result = parsedResult.data;

  return tokenSelected.map((token) => {
    const weightKey =
      `${token.coinSymbol.toLowerCase()}_weight` as keyof typeof result;
    return {
      coinType: token.coinType,
      targetPercentage: result[weightKey] as number,
      coinSymbol: token.coinSymbol,
    };
  });
}

export async function getSuggestionOfPortfolio({
  // current_holding,
  insight,
  // validPortfolio,
  currentValidHolding,
  tokenSelected,
}: {
  // current_holding: string;
  insight: string;
  currentValidHolding: TokenOnPortfolio[];
  tokenSelected: OnChainCoin[];
}) {
  try {
    const preference_instruct = await getNewestTradingInstruct();

    const portfolioParams = createPortfolioSchema(tokenSelected);

    // console.log(
    //   `System of getTradingPrompt:${JSON.stringify({
    //     current_holding: currentValidHolding,
    //     tokenSelected: tokenSelected,
    //     preference_instruct: preference_instruct,
    //   })}`
    // );
    const systemPrompt = getTradingPrompt({
      current_holding: currentValidHolding,
      tokenSelected: tokenSelected,
      preference_instruct: preference_instruct,
    });

    const { text, toolResults } = await generateText({
      model: provider(model),
      toolChoice: "required",
      tools: {
        adjust_portfolio: tool({
          description: `This tool is used to adjust the portfolio. You can adjust the portfolio. Notice that the sum of all weights should be 100. `,
          parameters: portfolioParams,
          execute: async (result) => {
            const { thinking } = result;

            // 使用辅助函数提取权重值
            const target_portfolio = extractWeightsFromResult({
              originalResult: result,
              tokenSelected: tokenSelected,
            });

            try {
              // console.log(`-- Adjust portfolio --`);

              // console.log(`Thinking:`, thinking);
              // console.log(`Target portfolio:`, target_portfolio);

              // // 调用核心函数进行调整
              // console.log(`Adjusting portfolio...`);
              // executeAdjustment({ targetPortfolio: target_portfolio })
              //   .then(() => {
              //     // db.insert(actionStateTable)
              //     //   .values({
              //     //     action: `adjust_portfolio: ${target_portfolio.map(
              //     //       (token) => {
              //     //         const parts = token.coinType.split("::");
              //     //         const tokenName = parts[parts.length - 1];
              //     //         return `${tokenName}:${token.targetPercentage}%\n`;
              //     //       }
              //     //     )}`,
              //     //     reason: thinking,
              //     //     details: {
              //     //       target_portfolio: target_portfolio,
              //     //     },
              //     //   })
              //     //   .then(() => {
              //     //     console.log(`Save portfolio action in DB successfully`);
              //     //   });
              //   })
              //   .catch((e) => {
              //     console.log(`Error in adjustToTargProportion`);
              //     console.log(e);
              //   });

              return {
                status: "success",
                target: target_portfolio,
                thinking: thinking,
              };
            } catch (e) {
              console.log("Error in adjust_portfolio tool");
              console.log(e);
              return {
                status: "error",
                error: "Failed to generate portfolio adjustment",
              };
            }
          },
        }),
      },

      maxSteps: 1,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `The market insight is \n${insight}`,
        },
      ],
    });

    return {
      status: toolResults[0].result.status,
      error: toolResults[0].result.error,
      target: toolResults[0].result.target,
      thinking: toolResults[0].result.thinking,
    };
  } catch (e) {
    console.log(e);
  }
}

export function getTradingPrompt({
  current_holding,
  tokenSelected,
  preference_instruct,
}: {
  current_holding: TokenOnPortfolio[];

  tokenSelected: OnChainCoin[];
  preference_instruct: string;
}) {
  // console.log(`${current_holding.length} tokens in current holding`);
  if (!current_holding || current_holding.length === 0) {
    throw new Error("Wrong in getTradingPrompt. Current holding is empty");
  }
  if (!tokenSelected || tokenSelected.length === 0) {
    throw new Error("Wrong in getTradingPrompt.   Token selected is empty");
  }
  const trading_instruct = `You are a professional trader and you have a portfolio on blockchain, which includes main Coin (Like APT, ETH, BNB, SUI, etc..), USDC and other altcoins. You want to adjust the portfolio to get best profit according to market situation. You main method is to adjust the weight of each token holding. 

User Preference is :${preference_instruct}

Current portfolio is ${current_holding.map((coin) => {
    return `
              ${coin.coinSymbol}:${coin.percentage}%(value:${coin.balanceUsd})
              `;
  })}

Introduction of all tokens are ${tokenSelected.map((token) => {
    return `${token.coinName}(${token.coinSymbol}):${token.description}\n`;
  })} \n
          `;
  return trading_instruct;
}
