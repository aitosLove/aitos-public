# Telegram Module

一个专注于 Telegram 信息交互的简单模块，通过事件池与 Agent Framework 进行通信。

## 功能特性

- 🤖 **简单易用**: 专注于 Telegram 交互，架构清晰
- 💬 **双向通信**: 接收用户消息，发送机器人回复
- 🔄 **事件驱动**: 通过 Agent Framework 事件池进行交互
- 🎯 **智能分析**: AI 分析事件内容，智能推送重要信息
- 🔐 **用户控制**: 支持白名单控制访问权限
- ⚡ **实时响应**: 支持命令处理和自然语言对话

## 核心组件

### 1. TelegramModule (`index.ts`)
主要的 Telegram 模块类，负责：
- 初始化 Telegram Bot
- 处理用户消息和命令
- 监听 Agent 事件并智能推送
- 管理用户权限

### 2. AIService (`ai-client.ts`)
简单的 AI 服务，负责：
- 处理用户聊天请求（一条进去，一条出来）
- 分析事件内容，判断是否值得推送给用户
- 生成智能回复和事件摘要

### 3. 测试模块 (`test-module.ts`)
模拟各种事件的测试环境，用于验证模块功能

## 快速开始

### 1. 环境配置

```bash
# 必需：设置 Telegram Bot Token
export TELEGRAM_BOT_TOKEN="your_bot_token_here"

# 可选：设置允许使用的用户ID（用逗号分隔）
export TELEGRAM_ALLOWED_USERS="user_id1,user_id2"
```

### 2. 在代码中使用

```typescript
import { Agent } from "@/src/agent";
import { enableTelegramModule, TelegramModuleConfig } from "@/src/modules/telegram";

const agent = new Agent({
  agentId: "your-agent-id",
  db: yourDatabase,
});

const config: TelegramModuleConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  allowedUsers: [123456789, 987654321], // 可选：限制用户
};

// 启用模块
const telegramModule = enableTelegramModule(agent, config);
```

### 3. 运行测试

```bash
# 设置环境变量后运行测试
cd /path/to/wonderland/back
npm run build
node dist/src/modules/telegram/test-module.js
```

## 事件交互

### 发送到 Agent 的事件

模块会向 Agent 事件池发送以下事件：

- `TG_USER_MESSAGE`: 用户发送消息
- `TG_AI_RESPONSE`: AI 回复用户
- `TG_STATUS_REQUEST`: 用户请求状态
- `TG_UNKNOWN_COMMAND`: 用户发送未知命令

### 监听 Agent 事件

模块监听所有 Agent 事件，通过 AI 分析决定是否推送给用户：

```typescript
// 高优先级事件会立即推送
testAgent.sensing.emitEvent({
  type: "PRICE_ALERT",
  description: "Price change alert",
  payload: { symbol: "BTC", change: "+15%" },
  timestamp: Date.now(),
});
```

## 支持的命令

- `/start` - 开始使用机器人
- `/help` - 显示帮助信息
- `/status` - 查看系统状态

## 使用示例

### 基本聊天
用户可以直接发送消息与 AI 聊天：
```
用户: "今天天气怎么样？"
AI: "我是一个AI助手，无法获取实时天气信息..."
```

### 触发事件测试
在测试模块中，发送特定消息可以触发模拟事件：
```
用户: "test event"
系统: 自动触发价格更新和系统警报事件

用户: "status"  
系统: 触发状态检查事件
```

### 智能通知
当系统发生重要事件时，AI 会分析并推送：
```
🔴 系统通知

📋 事件类型: PRICE_UPDATE
📝 摘要: BTC价格突破45000美元，涨幅7.5%
⏰ 时间: 2024-01-15 14:30:25
```

## 技术细节

- 使用 `node-telegram-bot-api` 进行 Telegram 交互
- 通过 AI SDK 提供智能对话能力
- 事件驱动架构，松耦合设计
- 支持优雅关闭和错误恢复
- TypeScript 编写，类型安全

## 注意事项

1. **Bot Token**: 必须设置有效的 Telegram Bot Token
2. **用户权限**: 建议在生产环境中设置 `allowedUsers` 限制访问
3. **AI 服务**: 需要配置相应的 AI 服务提供商（如 DeepSeek）
4. **错误处理**: 模块包含完善的错误处理和日志记录
