import { AgentTask } from "@/src/agent/core/Aclass InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState = new InvestmentState();
  private offListeners: Array<() => void> = []; // 存"关闭监听器"的函数
  private botManager: EnhancedTelegramBotManager;

  constructor(agent: Agent) {
    this.agent = agent;
    this.botManager = EnhancedTelegramBotManager.getInstance();
  }
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import TelegramBot from "node-telegram-bot-api";
import { HttpsProxyAgent } from "https-proxy-agent";
import { db } from "@/db";
import { tgMessageTable } from "@/db/schema/moduleSchema/tgSchema";
import { insightStateTable } from "@/db/schema/moduleSchema/defiSchema";
import cron from "node-cron";
import { EnhancedTelegramBotManager } from "./enhanced-bot-manager";
import { eq } from "drizzle-orm";
import { registerInsightCommands } from "./handle-commands";

export interface TGPayload {
  //   chatId: number;
  //   command: string;
  source: string;
}

export interface InsightPayload {
  insightId: string;
  timestamp: number;
}

export interface InsightRecord {
  id: string;
  content: string;
  sentAt: Date;
}

export interface UpdateRateEventPayload {}

export interface UpdateInsightEventPayload {}

export type TGTask = AgentTask<TGPayload>;

export class InvestmentState {
  async getInsightContent(insightId: string): Promise<string> {
    const record = await db.query.insightStateTable.findFirst({
      where: eq(insightStateTable.id, insightId)
    });
    return record?.insight || '';
  }
}

class InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState;
  private offListeners: Array<() => void> = []; // 存“关闭监听器”的函数
  private botManager: EnhancedTelegramBotManager;

  constructor(agent: Agent) {
    this.agent = agent;
    this.botManager = EnhancedTelegramBotManager.getInstance();
  }

  init() {
    // Register insight commands
    registerInsightCommands(this.botManager);

    // 注册事件监听
    // const commandHandler = this.agent.sensing.registerListener(
    //   (evt: AgentEvent) => {
    //     if (evt.type === "TELEGRAM_COMMAND") {
    //       this.handleTelegramCommand(evt.payload);
    //     }
    //   }
    // );
    // this.offListeners.push(commandHandler);

    // 新增INSIGHT事件监听
    const insightHandler = this.agent.sensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "UPDATE_INSIGHT_COMPLETE") {
          this.handleNewInsight(evt.payload as InsightPayload);
          // console.log("new insight event listened");
        }
      }
    );
    this.offListeners.push(insightHandler);

    // 设置定时任务
    // this.setupPriceScheduler();

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        this;
      }
    });
  }

  // 模拟事件泵
  // private setupPriceScheduler() {
  //   cron.schedule("*/10 * * * * *", () => {
  //     this.agent.sensing.emitEvent({
  //       type: "UPDATE_INSIGHT_COMPLETE",
  //       description: "Price updated. Now you should update insight.",
  //       payload: {},
  //       timestamp: Date.now(),
  //     });
  //     // console.log("event pump online");

  //     // this.createAutomatedTask({
  //     //   source: "BTC/USD in Binance: $61,234.56",
  //     // });

  //     // this.createAutomatedTask({
  //     //   source: "ETH/USD in Binance: $3,456.78",
  //     // });
  //   });
  // }

  // 任务
  private handleNewInsight(payload: InsightPayload) {
    this.agent.taskManager.createTask<InsightPayload>({
      type: "SEND_INSIGHT_TG",
      description: "Send latest insight to Telegram",
      payload,
      callback: async (payload) => {
        try {
          // 1. 获取insight内容
          // console.log("getting new insight content");

          // 换数据库了记得改这个地方拿insight
          const content = "another useless mock market insight!";
          // const content = await this.localState.getInsightContent({
          //   insightId: payload.insightId,
          // });

          // 2. 发送Telegram消息
          // console.log("sending to tg insight content");

          const success = await this.botManager.sendMessage(content);

          if (success) {
            // 3. 存储发送记录
            await storeMessageRecord({ content });
            // this.agent.logger.info(`Insight ${result.insightId} sent successfully`);
          }
        } catch (error) {
          // this.agent.logger.error(`Insight sending failed: ${error.message}`);
        }
      },
    });
  }

  private createAutomatedTask(payload: TGPayload) {
    this.agent.taskManager.createTask<TGPayload>({
      type: "AUTO_PRICE_UPDATE",
      description: "Automatic price reporting",
      payload,
      callback: async (result) => {
        const success = await this.botManager.sendMessage(result.source);
      },
    });
  }

  private handleTelegramCommand(payload: any) {
    if (payload.command === "/coin_price") {
      console.log("/coin_price command");
      this.botManager.sendMessage("mock coin prices");
    }
  }
}

export function enableTgInsightModule(agent: Agent) {
  // We should only init the investment manager logic after confirming enhanced module is ready
  const initInvestmentLogic = () => {
    const investmentMgr = new InvestmentManager(agent);
    investmentMgr.init();
    console.log("[enableTgInsightModule] Enhanced Telegram Investment Module Enabled.");
  };
  
  // Check if enhanced module is ready through an event check
  agent.sensing.emitEvent({
    type: "CHECK_ENHANCED_TG_MODULE",
    description: "Checking if enhanced Telegram module is ready",
    payload: {},
    timestamp: Date.now()
  });

  // Register a listener for module readiness
  const listener = agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "ENHANCED_TG_MODULE_READY") {
      initInvestmentLogic();
    } else if (evt.type === "ENHANCED_TG_MODULE_AVAILABLE") {
      // Module was already initialized
      initInvestmentLogic();
      // Remove listener since we don't need it anymore
      listener();
    }
  });

  // After 5 seconds, if we haven't received a response, initialize anyway
  setTimeout(() => {
    console.log("[enableTgInsightModule] Proceeding with initialization...");
    initInvestmentLogic();
    listener(); // Clean up listener
  }, 5000);
}

export async function storeMessageRecord({
  content,
}: {
  content: string;
}): Promise<void> {
  try {
    // 同时存储 insightId 用于后续追踪
    await db.insert(tgMessageTable).values({
      userId: "agent", // Default agent user ID
      role: "assistant",
      content,
      messageType: "notification",
      status: "sent",
    });
  } catch (error) {
    console.error("Failed to store record:", error);
    throw new Error("Failed to store insight record");
  }
}
