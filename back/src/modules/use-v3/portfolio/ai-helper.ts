import { getProvider, getModel } from "@/utils/ai";
import { z } from "zod";
import { generateText, tool } from "ai";
import { db } from "@/db";
import { actionStateTable } from "@/db/schema/moduleSchema";
import { TokenOnTargetPortfolio, adjustPortfolio } from "./core";
import { getHolding } from "./getHolding";
import { TOKEN_USE } from "../config";
import { select_portfolio } from "../config";

import { getNewestTradingInstruct } from "@/db/getInstruct";
import { getTradingPrompt } from "../config/prompt";
const select = "qwen";
const provider = getProvider({ provider: select });
const model = getModel({ inputModel: "large", provider: select });
const token_portfolio = select_portfolio;

// 动态生成 portfolioParams Schema
function createPortfolioSchema(tokens: TOKEN_USE[]) {
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

// 使用函数创建 portfolioParams
const portfolioParams = createPortfolioSchema(token_portfolio);

// 类型安全的从结果中提取权重值
function extractWeightsFromResult(
  result: z.infer<typeof portfolioParams>
): TokenOnTargetPortfolio[] {
  return token_portfolio.map((token) => {
    const weightKey =
      `${token.coinSymbol.toLowerCase()}_weight` as keyof typeof result;
    return {
      coinType: token.coinType,
      targetPercentage: result[weightKey] as number,
      coinSymbol: token.coinSymbol,
    };
  });
}

export async function adjustPortfolio_by_AI({
  current_holding,
  insight,
}: {
  current_holding: string;
  insight: string;
}) {
  try {
    const { validPortfolio } = await getHolding();
    const preference_instruct = await getNewestTradingInstruct();

    const systemPrompt = getTradingPrompt({
      current_holding: validPortfolio,
      token_portfolio: token_portfolio,
      preference_instruct: preference_instruct,
    });

    const { text, toolResults } = await generateText({
      model: provider(model),
      toolChoice: "required",
      tools: {
        adjust_portfolio: tool({
          description:
            "This tool is used to adjust the portfolio. You can adjust the portfolio. Notice that the sum of all weights should be 100.",
          parameters: portfolioParams,
          execute: async (result) => {
            const { thinking } = result;

            // 使用辅助函数提取权重值
            const target_portfolio = extractWeightsFromResult(result);

            try {
              console.log(`-- Adjust portfolio --`);

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
                      details: {
                        target_portfolio: target_portfolio,
                      },
                    })
                    .then(() => {
                      console.log(`Save portfolio action in DB successfully`);
                    });
                })
                .catch((e) => {
                  console.log(`Error in adjustToTargProportion`);
                  console.log(e);
                });

              return {
                status: "success",
                target: target_portfolio,
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
          content: systemPrompt,
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
