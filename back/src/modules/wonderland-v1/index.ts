import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";

import { InvestmentState } from "./market/cmc";
import { updateDefiStrategy } from "./task/updateDefiStrategy";
import { updatePrice } from "./task/updatePrice";
import { updateInsight } from "./task/updateInsight";
import { updateHolding } from "./task/updateHolding";
import { updatePortfolio } from "./task/updatePortfolio";

class InvestmentManager {
  private agent: Agent;
  private localState: InvestmentState;

  constructor(agent: Agent) {
    this.agent = agent;
    this.localState = new InvestmentState();
  }

  init() {
    // event link : update rate(新的价格和比值数据) -》 update insight(新的见解) -》 update portfolio(新的投资组合) -》 update holding(立刻刷新持仓数据)
    // 特别的，holding每5分钟会额外进行一次，来帮助前端获取新的持仓数据，这个过程很容易爆调用，所以要做缓存

    this.agent.sensing.registerListener((evt: AgentEvent) => {
      if (evt.type === "UPDATE_RATE_EVENT") {
        // console.log("Received UPDATE_RATE_EVENT");
        this.updatePricesTask();
      }

      if (evt.type === "UPDATE_INSIGHT_EVENT") {
        this.updateInsightsTask();
      }

      if (evt.type === "UPDATE_PORTFOLIO_EVENT") {
        this.updatePortfolioTask();
      }

      if (evt.type === "UPDATE_HOLDING_EVENT") {
        this.updateHoldingTask();
      }

      if (evt.type === "UPDATE_DEFI_STRATEGY_EVENT") {
        this.updateDefiStrategyTask();
      }
    });
  }

  // 任务方法：更新价格
  updatePricesTask() {
    updatePrice(this.agent, this.localState);

    console.log(`time${Date.now()} updatePricesTask`);
  }

  // 任务方法：更新认知（根据价格生成见解）
  updateInsightsTask() {
    updateInsight(this.agent, this.localState);

    console.log(`time${Date.now()} updateInsightsTask`);
  }

  updateDefiStrategyTask() {
    updateDefiStrategy(this.agent);
  }

  updatePortfolioTask() {
    updatePortfolio(this.agent);
  }

  updateHoldingTask() {
    updateHolding(this.agent);
  }
}

export function enableWonderlandModule(agent: Agent) {
  const investmentMgr = new InvestmentManager(agent);
  investmentMgr.init();

  cron.schedule("0 */30 * * * *", async () => {
    // 触发更新价格任务
    agent.sensing.emitEvent({
      type: "UPDATE_RATE_EVENT",
      description: "Agent should update price rate",
      payload: {},
      timestamp: Date.now(),
    });
  });

  cron.schedule("0 */30 * * * *", async () => {
    // 定时触发更新defi strategy
    agent.sensing.emitEvent({
      type: "UPDATE_DEFI_STRATEGY_EVENT",
      description: "Agent should update the strategy of defi",
      timestamp: Date.now(),
    });
  });

  // 定时触发更新holding
  cron.schedule("0 */5 * * * *", async () => {
    agent.sensing.emitEvent({
      type: "UPDATE_HOLDING_EVENT",
      description: "Agent should update holding",
      payload: {},
      timestamp: Date.now(),
    });
  });

  agent.sensing.emitEvent({
    type: "UPDATE_RATE_EVENT",
    description: "Agent should update price rate.",
    payload: {},
    timestamp: Date.now(),
  });

  // agent.sensing.emitEvent({
  //   type: "UPDATE_INSIGHT_EVENT",
  //   description: "Agent should update insight.",
  //   payload: {},
  //   timestamp: Date.now(),
  // });

  // agent.sensing.emitEvent({
  //   type: "UPDATE_PORTFOLIO_EVENT",
  //   description: "Agent should update portfolio.",
  //   payload: {},
  //   timestamp: Date.now(),
  // });

  // agent.sensing.emitEvent({
  //   type: "UPDATE_HOLDING_EVENT",
  //   description: "Agent should update holding.",
  //   payload: {},
  //   timestamp: Date.now(),
  // });
  // agent.sensing.emitEvent({
  //   type: "UPDATE_DEFI_STRATEGY_EVENT",
  //   description: "Agent should update the strategy of defi.",
  //   payload: {},
  //   timestamp: Date.now(),
  // });
}
