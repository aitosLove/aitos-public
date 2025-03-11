import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import TelegramBot from "node-telegram-bot-api";
import { HttpsProxyAgent } from "https-proxy-agent";

import cron from "node-cron";
import { TelegramBotManager } from "./bot_manager";

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

class InvestmentState {
  private state: Map<string, any> = new Map();
  private insights: InsightRecord[] = []; // 模拟数据库表

  async getInsightContent(insightId: string): Promise<string> {
    // 模拟数据库查询
    const record = this.insights.find((i) => i.id === insightId);
    return record?.content || "No insight available";
  }

  async storeInsightRecord(content: string): Promise<void> {
    // 模拟数据库插入
    this.insights.push({
      id: `insight_${Date.now()}`,
      content,
      sentAt: new Date(),
    });
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
    this.botManager.initializeBot(this.agent);

    // 注册事件监听
    const commandHandler = this.agent.sensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "TELEGRAM_COMMAND") {
          this.handleTelegramCommand(evt.payload);
        }
      }
    );
    this.offListeners.push(commandHandler);

    // 新增INSIGHT事件监听
    const insightHandler = this.agent.sensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "UPDATE_INSIGHT_COMPLETE") {
          this.handleNewInsight(evt.payload as InsightPayload);
        }
      }
    );
    this.offListeners.push(insightHandler);
    
    // 设置定时任务
    this.setupPriceScheduler();

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        this;
      }
    });
  }

  // 事件泵
  private setupPriceScheduler() {
    cron.schedule("*/10 * * * * *", () => {
      this.createAutomatedTask({
        source: "BTC/USD in Binance: $61,234.56",
      });

      this.createAutomatedTask({
        source: "ETH/USD in Binance: $3,456.78",
      });
    });
  }


  // 任务
  private handleNewInsight(payload: InsightPayload) {
    this.agent.taskManager.createTask<InsightPayload>({
      type: "SEND_INSIGHT_TG",
      descrpition: "Send latest insight to Telegram",
      payload,
      callback: async (result) => {
        try {
          // 1. 获取insight内容
          const content = await this.localState.getInsightContent(result.insightId);
          
          // 2. 发送Telegram消息
          const success = await this.botManager.sendMessage(content);
          
          if (success) {
            // 3. 存储发送记录
            await this.localState.storeInsightRecord(content);
            // this.agent.logger.info(`Insight ${result.insightId} sent successfully`);
          }
        } catch (error) {
          // this.agent.logger.error(`Insight sending failed: ${error.message}`);
        }
      }
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
      this.botManager.sendMessage(
        JSON.stringify({
          BTC: { source: "BTC/USD in Binance" },
          ETH: { source: "ETH/USD in Binance" },
        })
      );
    }
  }
}

export function enableTgMessageModule(agent: Agent) {
  const investmentMgr = new InvestmentManager(agent);
  investmentMgr.init();
  console.log("[ScheduleModule] Enabled.");

  // 若后续想关闭
  // scheduleMgr.teardown();
}
