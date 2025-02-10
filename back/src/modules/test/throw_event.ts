import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";

import cron from "node-cron";

export interface ETHPayload {
  source: string;
}
export interface BTCPayload {
  source: string;
}

export interface UpdateRateEventPayload {}

export interface UpdateInsightEventPayload {}

export type ETHTask = AgentTask<ETHPayload>;
export type BTCTask = AgentTask<BTCPayload>;

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

  constructor(agent: Agent) {
    this.agent = agent;
    this.localState = new InvestmentState();
  }

  init() {
    // 监听1: ETH Price
    const off1 = this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "ETH_PRICE_TASK") {
        const payload = evt.payload as ETHPayload;
        this.createETHTask(payload);
      }
    });

    // 监听2: BTC Price
    const off2 = this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "BTC_PRICE_TASK") {
        const payload = evt.payload as BTCPayload;
        this.createBTCTask(payload);
      }
    });

    this.offListeners.push(off1, off2);

    cron.schedule("*/10 * * * * *", async () => {
      this.agent.sensing.emitEvent({
        type: "ETH_PRICE_TASK",
        payload: { source: "ETH/USD in Binance" },
        timestamp: Date.now(),
        description: "ETH Price Task",
      });

      this.agent.sensing.emitEvent({
        type: "BTC_PRICE_TASK",
        payload: { source: "BTC/USD in Binance" },
        timestamp: Date.now(),
        description: "BTC Price Task",
      });
    });

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        this;
      }
    });
  }

  createBTCTask(payload: BTCPayload) {
    // 1. 创建任务
    const newTask = this.agent.taskManager.createTask<BTCPayload>({
      type: "BTC_PRICE_TASK",
      descrpition: "BTC Price Task",
      payload,
      callback: (payload) => {
        console.log("BTC Price Task Callback:", payload);
        this.agent.thinking.response({
          input: "what s your opinion on btc",
          systemPrompt: "reply in short no more than 20 words",
        });
      },
    }) as BTCTask;

    this.localState.set(`btc price`, "new one");
  }

  createETHTask(payload: BTCPayload) {
    // 1. 创建任务
    const newTask = this.agent.taskManager.createTask<BTCPayload>({
      type: "ETH_PRICE_TASK",
      descrpition: "ETH Price Task",
      payload,
      callback: (payload) => {
        console.log("ETH Price Task Callback:", payload);
        this.agent.thinking.response({
          input: "what s your opinion on eth",
          systemPrompt: "reply in short no more than 20 words",
        });
      },
    }) as BTCTask;
  }

  showStatus() {
    console.log("[InvestmentManager] localState:", this.localState);
  }
}

export function enableThrowEventModule(agent: Agent) {
  const investmentMgr = new InvestmentManager(agent);
  investmentMgr.init();
  console.log("[ScheduleModule] Enabled.");

  // 若后续想关闭
  // scheduleMgr.teardown();
}
