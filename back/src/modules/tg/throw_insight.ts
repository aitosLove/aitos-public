import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import TelegramBot from "node-telegram-bot-api";
import { HttpsProxyAgent } from "https-proxy-agent";
import { db } from "@/db";
import { insightStateTable, tgMessageTable } from "@/db/schema";
import cron from "node-cron";
import { TelegramBotManager } from "./bot_manager";
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
  private state: Map<string, any> = new Map();

  async getInsightContent({
    insightId,
  }: {
    insightId: string;
  }): Promise<string> {
    try {
      const record = await db.query.insightStateTable.findFirst({
        where: eq(insightStateTable, insightId),
      });

      if (!record) {
        throw new Error(`Insight ${insightId} not found`);
      }
      return record.insight;
    } catch (error) {
      console.error("Failed to fetch insight:", error);
      throw new Error("Failed to retrieve insight content");
    }
  }

  

  set(key: string, value: any) {
    this.state.set(key, value);
  }

  get(key: string) {
    return this.state.get(key);
  }
}

class InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState;
  private offListeners: Array<() => void> = []; // 存“关闭监听器”的函数
  private botManager: TelegramBotManager;

  constructor(agent: Agent) {
    this.agent = agent;
    this.localState = new InvestmentState();
    this.botManager = TelegramBotManager.getInstance();
  }

  init() {
    // 初始化bot并连接Agent
    const botManager = TelegramBotManager.getInstance();
    botManager.initializeBot(this.agent);

    // Register insight commands
    registerInsightCommands(botManager);

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
      descrpition: "Send latest insight to Telegram",
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
      descrpition: "Automatic price reporting",
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
  const investmentMgr = new InvestmentManager(agent);
  investmentMgr.init();
  console.log("[enableTgInsightModule] Enabled.");

  // 若后续想关闭
  // scheduleMgr.teardown();
}


export async  function storeMessageRecord({ content }: { content: string }): Promise<void> {
  try {
    // 同时存储 insightId 用于后续追踪
    await db.insert(tgMessageTable).values({
      content,
      status: "sent",
    });
  } catch (error) {
    console.error("Failed to store record:", error);
    throw new Error("Failed to store insight record");
  }
}