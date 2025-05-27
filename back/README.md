# Wonderland V2 Backend

## Sekai Agent 框架

Sekai Agent 框架是一个事件驱动型的异步智能体架构，专门设计用于处理复杂的决策和自动化任务。其核心理念是通过事件与任务的解耦，实现高度灵活且可扩展的自动化流程。

### 核心特点

- **事件驱动**：系统通过事件触发任务，而不是直接调用函数
- **异步处理**：任务可以异步执行，不阻塞主流程
- **模块化设计**：功能被封装为独立模块，可以自由组合
- **蓝图系统**：通过蓝图组合模块，实现复杂业务逻辑

## Event-Task 机制

Event-Task 是框架的核心运行机制，实现了事件与任务的解耦：

1. **事件 (Event)**：

   - 系统中的状态变化或外部触发
   - 包含类型、载荷、描述和时间戳
   - 通过 `sensing.emitEvent()` 发布

2. **任务 (Task)**：

   - 响应特定事件执行的操作
   - 包含类型、描述、载荷和回调函数
   - 通过 `taskManager.createTask()` 创建

3. **工作流程**：
   - 事件被发布到系统
   - 监听器捕获事件并创建相应任务
   - 任务异步执行，完成后可能触发新事件

示例：

```typescript
// 发布事件
agent.sensing.emitEvent({
  type: "GET_HOLDING_REQUEST",
  description: "Request current portfolio holdings",
  payload: {},
  timestamp: Date.now(),
});

// 监听事件并创建任务
agent.sensing.registerListener((evt: AgentEvent) => {
  if (evt.type === "GET_HOLDING_REQUEST") {
    agent.taskManager.createTask({
      type: "GET_HOLDING_TASK",
      description: "Get portfolio holdings",
      payload: null,
      callback: async () => {
        // 处理逻辑
      },
    });
  }
});
```

## 感知器 (Sensing)

框架提供两种感知器，用于事件的发布和订阅：

### 私有感知器 (Private Sensing)

- 每个 Agent 实例独有的事件总线
- 用于处理 Agent 内部的事件流
- 通过 `agent.sensing` 访问

```typescript
agent.sensing.emitEvent({
  type: "INTERNAL_EVENT",
  description: "Agent internal event",
  payload: {},
  timestamp: Date.now(),
});
```

### 群组感知器 (Group Sensing)

- 多个 Agent 之间共享的事件总线
- 用于实现 Agent 之间的通信和协作
- 通过 `agent.groupSensing` 访问

```typescript
agent.groupSensing.emitEvent({
  type: "GLOBAL_EVENT",
  description: "Event shared across agents",
  payload: {},
  timestamp: Date.now(),
});
```

## 模块与蓝图

### 模块 (Module)

模块是实现特定功能的代码单元，具有以下特点：

- **功能导向**：实现特定领域的功能
- **自包含**：包含所有必要的逻辑和数据处理
- **可复用**：可被多个蓝图使用
- **事件导向**：通过事件驱动，命名反映功能

示例模块：APTOS 投资组合模块、市场分析模块、TG 通知模块

### 蓝图 (Blueprint)

蓝图是模块的组合和编排，用于实现特定业务流程：

- **业务导向**：实现完整的业务流程
- **组合多模块**：协调多个模块协同工作
- **定制流程**：定义模块之间的交互
- **面向使用者**：事件和任务命名面向业务场景

示例蓝图：自动交易蓝图、市场监控蓝图、投资建议蓝图

### 区别总结

| 特性     | 模块 (Module)                    | 蓝图 (Blueprint)                        |
| -------- | -------------------------------- | --------------------------------------- |
| 关注点   | 功能实现                         | 业务流程                                |
| 复用性   | 高                               | 中                                      |
| 命名风格 | 功能性 (getHolding, executeSwap) | 业务性 (initPortfolio, scheduleTrading) |
| 独立性   | 高                               | 低                                      |
| 依赖     | 低                               | 依赖多个模块                            |

## 模块开发规范

模块开发应遵循以下规范，确保代码可维护性和兼容性：

### 事件与任务命名

- **直接反映功能**：名称应直接表明所执行的操作
- **动词+名词结构**：如 `GET_HOLDING_REQUEST`、`UPDATE_PRICE_TASK`
- **描述性**：名称应自解释，不需要额外注释
- **一致性**：相关事件应使用一致的命名模式

### 标准事件后缀

- **\_REQUEST**：请求执行某操作
- **\_RESULT**：操作执行结果
- **\_ERROR**：操作执行失败
- **\_COMPLETED**：操作完成

### 标准函数格式

```typescript
export function enableXxxModule(agent: Agent, options: XxxOptions) {
  // 初始化资源

  // 注册事件监听器
  const offXxxListener = agent.sensing.registerListener((evt) => {
    // 事件处理逻辑
  });

  // 返回清理函数
  return {
    offListener: {
      xxx: offXxxListener,
      // 其他监听器
    },
  };
}
```

## 蓝图开发规范

蓝图将多个模块组合为完整的业务流程，应遵循以下规范：

### 事件与任务命名

- **反映业务场景**：如 `TRADING_TIME_REACHED`、`PORTFOLIO_REBALANCING_START`
- **面向使用者**：使用业务领域术语，而非技术术语
- **流程导向**：名称应反映业务流程步骤

### 组织结构

```typescript
export function setupXxxBlueprint(options) {
  // 创建 Agent 实例
  const agent = new Agent({...});

  // 启用所需模块
  const moduleA = enableModuleA(agent, {...});
  const moduleB = enableModuleB(agent, {...});

  // 定义业务逻辑和事件流
  agent.sensing.registerListener((evt) => {
    // 业务流程编排
  });

  // 初始化流程
  agent.sensing.emitEvent({
    type: "INITIALIZE_PROCESS",
    description: "Start the business process",
    payload: {},
    timestamp: Date.now()
  });

  // 返回 Agent 和清理函数
  return {
    agent,
    teardown: () => {
      moduleA.offListener.xxx();
      moduleB.offListener.yyy();
    }
  };
}
```

## 最佳实践

1. **模块专注于功能**：每个模块只实现单一责任领域的功能
2. **蓝图专注于流程**：蓝图不实现具体功能，只负责编排模块
3. **事件命名一致性**：模块内部使用功能导向命名，蓝图使用业务导向命名
4. **错误处理**：每个操作都应有对应的错误事件
5. **文档化**：为每个模块和蓝图提供清晰的文档说明

---

## 项目模块概览

当前项目包含以下核心模块：

- **aptosPortfolio**：APTOS 区块链投资组合管理
- **autoPortfolio**：自动投资组合管理和优化
- **cmcAnalysis**：CoinMarketCap 数据分析
- **tg**：Telegram 消息通知和交互
- **use-v3**：多账户资金管理单元

## 资金单元

use-v3 模块引入了资金单元概念，作为多账户管理的基础。通过资金单元，系统能够：

- 独立管理多个账户的资产
- 跟踪不同策略的表现
- 灵活分配资金到不同投资策略
- 聚合分析整体投资组合表现

资金单元是实现多账户策略的核心基础设施，为系统提供了可扩展性。
