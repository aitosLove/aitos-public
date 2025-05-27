import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import { AptosAccountManager } from "../autoPortfolio/chain/apt/account";
import { getSuggestionOfPortfolio } from "../autoPortfolio/agent/ai-helper";
import { executeAdjustment } from "../autoPortfolio/agent/makeAdjust";
import { HyperionSwapKit } from "../autoPortfolio/dex/hyperion";
import { OnChainCoin, TokenOnPortfolio } from "../autoPortfolio/type";
import { db } from "@/db";
import {
  insightStateTable,
  portfolioSuggestionTable,
} from "@/db/schema/moduleSchema/defiSchema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config();

interface AptosPortfolioOptions {
  selectedTokens: OnChainCoin[];
  privateKey: string;
  panoraApiKey?: string;
  slippage?: number;
  detailed?: boolean;
}

interface GetSuggestionEvent extends AgentEvent {
  payload: {
    insight: string;
    // currentHolding: TokenOnPortfolio[];
  };
}
/**
 * 启用 APTOS 投资组合模块
 */
export function enableAptosPortfolioModule(
  agent: Agent,
  options: AptosPortfolioOptions
) {
  const {
    selectedTokens,
    privateKey,
    panoraApiKey,
    slippage = 1,
    detailed = false,
  } = options;

  // 初始化 AptosAccountManager
  const accountManager = new AptosAccountManager({
    privateKey,
    panoraApiKey,
  });

  // 初始化 HyperionSwapKit
  const swapKit = new HyperionSwapKit({
    slippage,
    accountManager,
  });

  // 保存待处理的调整方案
  let pendingAdjustment: {
    targets: any[];
    originalPortfolio: TokenOnPortfolio[];
    stableCoin: OnChainCoin;
  } | null = null;

  // 获取稳定币
  const getStableCoin = () =>
    selectedTokens.find(
      (token) =>
        token.coinSymbol.includes("USDC") ||
        token.coinSymbol.includes("USDT") ||
        token.coinSymbol.includes("USD")
    ) || selectedTokens[0];

  // 监听获取持仓事件
  const offGetHoldingListener = agent.sensing.registerListener(
    (evt: AgentEvent) => {
      if (evt.type === "GET_HOLDING_REQUEST") {
        if (detailed) {
          console.log("接收到获取持仓请求事件. 正在创建任务...");
        }

        agent.taskManager.createTask<null>({
          type: "GET_HOLDING_TASK",
          description: "Get current Aptos portfolio holdings",
          payload: null,
          callback: async () => {
            try {
              const holdings = await accountManager.getHolding({
                selectPortfolio: selectedTokens,
              });

              agent.sensing.emitEvent({
                type: "GET_HOLDING_RESULT",
                description: "Successfully retrieved Aptos portfolio holdings",
                payload: { holdings },
                timestamp: Date.now(),
              });
            } catch (e) {
              console.error("Error getting holdings:", e);
              agent.sensing.emitEvent({
                type: "GET_HOLDING_ERROR",
                description: "Failed to get Aptos portfolio holdings",
                payload: { error: e },
                timestamp: Date.now(),
              });
            }
          },
        });
      }
    }
  );

  // 监听获取投资建议事件
  const offGetSuggestionListener = agent.sensing.registerListener(
    async (evt: AgentEvent) => {
      if (evt.type === "GET_PORTFOLIO_SUGGESTION_REQUEST") {
        if (detailed) {
          console.log("接收到获取投资建议请求事件. 正在创建任务...");
        }

        const getSuggestionEvent = evt as GetSuggestionEvent;

        const currentHolding = await accountManager.getHolding({
          selectPortfolio: selectedTokens,
        });

        agent.taskManager.createTask<{
          insight: string;
          currentHolding: TokenOnPortfolio[];
        }>({
          type: "GET_PORTFOLIO_SUGGESTION_TASK",
          description: "Get investment suggestion for Aptos portfolio",
          payload: {
            insight: getSuggestionEvent.payload.insight,
            // currentHolding: getSuggestionEvent.payload.currentHolding,
            currentHolding: currentHolding.validPortfolio,
          },
          callback: async (payload) => {
            try {
              const { insight, currentHolding } = payload;

              // 获取投资组合调整建议
              const suggestion = await getSuggestionOfPortfolio({
                insight,
                currentValidHolding: currentHolding,
                tokenSelected: selectedTokens,
              });

              if (
                suggestion &&
                suggestion.status === "success" &&
                suggestion.target
              ) {
                // 保存待处理的调整方案
                pendingAdjustment = {
                  targets: suggestion.target,
                  originalPortfolio: currentHolding,
                  stableCoin: getStableCoin(),
                };

                // 保存到数据库
                await db.insert(portfolioSuggestionTable).values({
                  suggestion: JSON.stringify({
                    targets: suggestion.target,
                    thinking: suggestion.thinking,
                  }),
                  timestamp: new Date(Date.now()),
                  executionStatus: "pending",
                  agentId: agent.agentId,
                });

                // 发送建议结果事件
                agent.sensing.emitEvent({
                  type: "GET_PORTFOLIO_SUGGESTION_RESULT",
                  description: "Successfully generated portfolio suggestion",
                  payload: {
                    targets: suggestion.target,
                    thinking: suggestion.thinking,
                  },
                  timestamp: Date.now(),
                });
              } else {
                throw new Error(
                  suggestion?.error || "Failed to get portfolio suggestions"
                );
              }
            } catch (e) {
              console.error("Error getting portfolio suggestion:", e);
              agent.sensing.emitEvent({
                type: "GET_PORTFOLIO_SUGGESTION_ERROR",
                description: "Failed to get portfolio suggestion",
                payload: { error: e },
                timestamp: Date.now(),
              });
            }
          },
        });
      }
    }
  );

  // 监听确认调整事件
  const offConfirmAdjustmentListener = agent.sensing.registerListener(
    (evt: AgentEvent) => {
      if (evt.type === "CONFIRM_PORTFOLIO_ADJUSTMENT") {
        if (detailed) {
          console.log("接收到确认调整请求事件. 正在创建任务...");
        }

        agent.taskManager.createTask<null>({
          type: "CONFIRM_PORTFOLIO_ADJUSTMENT_TASK",
          description: "Execute portfolio adjustment for Aptos",
          payload: null,
          callback: async () => {
            try {
              if (!pendingAdjustment) {
                throw new Error("No pending portfolio adjustment to confirm");
              }

              const { targets, originalPortfolio, stableCoin } =
                pendingAdjustment;

              // 执行投资组合调整
              await executeAdjustment({
                targetPortfolio: targets,
                originalPortfolio: originalPortfolio,
                swapOptions: {
                  swap: swapKit.swap.bind(swapKit),
                  STABLE_COIN: stableCoin,
                },
              });

              // 更新数据库中的执行状态
              await db
                .update(portfolioSuggestionTable)
                .set({
                  executionStatus: "completed",
                  executionTime: new Date(Date.now()),
                })
                .where(
                  sql`id = (SELECT id FROM ${portfolioSuggestionTable} ORDER BY timestamp DESC LIMIT 1)`
                );

              // 清空待处理调整
              pendingAdjustment = null;

              // 发送完成事件
              agent.sensing.emitEvent({
                type: "PORTFOLIO_ADJUSTMENT_COMPLETED",
                description: "Successfully executed portfolio adjustment",
                payload: {},
                timestamp: Date.now(),
              });

              // 触发获取最新持仓
              agent.sensing.emitEvent({
                type: "GET_HOLDING_REQUEST",
                description:
                  "Request updated portfolio holdings after adjustment",
                payload: {},
                timestamp: Date.now(),
              });
            } catch (e) {
              console.error("Error executing portfolio adjustment:", e);
              agent.sensing.emitEvent({
                type: "PORTFOLIO_ADJUSTMENT_FAILED",
                description: "Failed to execute portfolio adjustment",
                payload: { error: e },
                timestamp: Date.now(),
              });

              if (pendingAdjustment) {
                // 更新数据库中的执行状态
                await db
                  .update(portfolioSuggestionTable)
                  .set({
                    executionStatus: "failed",
                    executionTime: new Date(Date.now()),
                  })
                  .where(
                    sql`id = (SELECT id FROM ${portfolioSuggestionTable} ORDER BY timestamp DESC LIMIT 1)`
                  );
              }
            }
          },
        });
      }
    }
  );

  // 返回用于关闭监听器的函数集合
  return {
    offListener: {
      getHolding: offGetHoldingListener,
      getSuggestion: offGetSuggestionListener,
      confirmAdjustment: offConfirmAdjustmentListener,
    },
  };
}
