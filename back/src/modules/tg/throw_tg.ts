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

export interface UpdateRateEventPayload {}

export interface UpdateInsightEventPayload {}

export type TGTask = AgentTask<TGPayload>;

class InvestmentState {
  private state: Map<string, any> = new Map();

  private insight: string;

  constructor() {
    this.insight = "no insight";
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

    // 设置定时任务
    this.setupPriceScheduler();

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        this;
      }
    });
  }

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
