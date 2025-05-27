# APTOS Portfolio Module

这个模块是基于 Sekai Agent 框架开发的 APTOS 投资组合管理模块，提供自动投资组合管理、调整建议和执行调整功能。

## 功能特点

- 获取当前 APTOS 账户持仓数据
- 基于市场洞察生成投资组合调整建议
- 执行投资组合调整（调仓操作）
- 使用 Hyperion DEX 进行代币交换
- 基于事件驱动的异步处理机制
- 与 Agent 架构无缝集成

## 事件类型

模块注册以下事件类型：

- `GET_HOLDING_REQUEST`: 请求获取当前持仓信息
- `GET_HOLDING_RESULT`: 返回当前持仓信息
- `GET_HOLDING_ERROR`: 获取持仓信息失败
- `GET_PORTFOLIO_SUGGESTION_REQUEST`: 请求获取投资建议
- `GET_PORTFOLIO_SUGGESTION_RESULT`: 返回投资建议
- `GET_PORTFOLIO_SUGGESTION_ERROR`: 获取投资建议失败
- `CONFIRM_PORTFOLIO_ADJUSTMENT`: 确认执行投资组合调整
- `PORTFOLIO_ADJUSTMENT_COMPLETED`: 投资组合调整完成
- `PORTFOLIO_ADJUSTMENT_FAILED`: 投资组合调整失败

## 安装和配置

1. 确保您的项目中已安装必要的依赖:

```bash
npm install @aptos-labs/ts-sdk @hyperionxyz/sdk @panoraexchange/swap-sdk
```

2. 配置环境变量 (在 `.env` 文件中):

```
APTS_PRIVATE_KEY=<您的APTOS私钥>
```

## 使用方法

### 基本用法

```typescript
import { Agent } from "@/src/agent";
import { enableAptosPortfolioModule } from "./modules/aptosPortfolio";
import { APT, USDC, AMI } from "./modules/autoPortfolio/chain/apt/coin";

// 创建 Agent 实例
const agent = new Agent({
  agentId: "aptos-portfolio-agent",
  name: "APTOS Portfolio Manager",
});

// 启用 APTOS 投资组合模块
const module = enableAptosPortfolioModule(agent, {
  privateKey: process.env.APTS_PRIVATE_KEY,
  selectedTokens: [APT, USDC, AMI],
  detailed: true, // 启用详细日志
});

// 触发获取持仓事件
agent.sensing.emitEvent({
  type: "GET_HOLDING_REQUEST",
  description: "Request current portfolio holdings",
  payload: {},
  timestamp: Date.now(),
});
```

### 监听事件

```typescript
// 监听持仓结果事件
agent.sensing.registerListener((evt) => {
  if (evt.type === "GET_HOLDING_RESULT") {
    console.log("Portfolio holdings:", evt.payload.holdings);

    // 使用持仓数据执行后续操作...
  }
});
```

### 获取投资建议

```typescript
// 触发获取投资建议事件
agent.sensing.emitEvent({
  type: "GET_PORTFOLIO_SUGGESTION_REQUEST",
  description: "Request portfolio suggestion",
  payload: {
    insight: "市场洞察分析文本...",
    currentHolding: currentHoldings,
  },
  timestamp: Date.now(),
});
```

### 确认执行调整

```typescript
// 确认执行投资组合调整
agent.sensing.emitEvent({
  type: "CONFIRM_PORTFOLIO_ADJUSTMENT",
  description: "Confirm portfolio adjustment",
  payload: {},
  timestamp: Date.now(),
});
```

## 示例

请参考 `example.ts` 文件了解完整的使用示例，该示例演示了如何：

1. 创建 Agent 实例
2. 启用 APTOS 投资组合模块
3. 触发和监听各种事件
4. 实现自动投资组合管理流程

## 工作流程

1. 触发 `GET_HOLDING_REQUEST` 事件获取当前持仓
2. 系统返回 `GET_HOLDING_RESULT` 事件，包含持仓数据
3. 触发 `GET_PORTFOLIO_SUGGESTION_REQUEST` 事件，请求投资建议
4. 系统返回 `GET_PORTFOLIO_SUGGESTION_RESULT` 事件，包含投资建议
5. 触发 `CONFIRM_PORTFOLIO_ADJUSTMENT` 事件确认执行调整
6. 系统执行调整并返回 `PORTFOLIO_ADJUSTMENT_COMPLETED` 或 `PORTFOLIO_ADJUSTMENT_FAILED` 事件

## 扩展与集成

本模块设计为可与 Agent 系统的其他模块无缝集成。例如，您可以将它与：

- 市场分析模块集成，获取实时市场洞察
- 通知模块集成，发送投资组合调整通知
- 风险管理模块集成，实现风险控制
