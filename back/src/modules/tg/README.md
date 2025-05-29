# 增强版 Telegram 机器人模块

## 🚀 简介

这是一个全新设计的增强版 Telegram 机器人模块，相比原版本有了巨大的改进：

### 🆚 新旧版本对比

| 功能 | 原版本 | 增强版 |
|------|--------|--------|
| 命令处理 | ✅ 基础命令 | ✅ 分类命令 + 冷却机制 |
| AI 对话 | ❌ 无上下文 | ✅ 智能对话 + 记忆 |
| 事件集成 | ❌ 基础监听 | ✅ 深度集成所有模块 |
| 用户体验 | ❌ 简陋文本 | ✅ 富文本 + 格式化 |
| 错误处理 | ❌ 基础提示 | ✅ 详细错误信息 |
| 会话管理 | ❌ 无状态 | ✅ 会话记录 + 自动清理 |
| 通知推送 | ❌ 手动 | ✅ 智能自动通知 |

## 🎯 核心功能

### 1. 智能对话系统
- **上下文记忆**: 记住对话历史，提供连贯的交流体验
- **自动对话**: 直接发送消息即可开始聊天，无需命令
- **专业回复**: 专门针对加密货币领域优化的 AI 回复

### 2. 内容分析集成
- **实时洞察**: 自动展示 X 平台内容分析结果
- **深度研究**: 查看 Perplexity 深度搜索报告
- **价值筛选**: 只推送有价值的内容洞察

### 3. 命令分类系统
- **AI 助手** (`ai`): 智能对话相关
- **内容分析** (`content`): 洞察和研究功能
- **加密货币** (`crypto`): 市场和价格信息
- **投资组合** (`portfolio`): 投资管理功能
- **系统功能** (`system`): 状态和管理命令

### 4. 高级特性
- **命令冷却**: 防止滥用，提高系统稳定性
- **会话管理**: 自动清理过期会话
- **智能通知**: 重要事件自动推送
- **错误处理**: 详细的错误信息和建议

## 📱 使用指南

### 基础命令

```
/help               - 查看所有命令（按分类显示）
/chat <消息>        - 与 AI 助手聊天
/status            - 查看系统状态
```

### 内容分析命令

```
/insights          - 查看最新内容洞察
/research          - 查看深度研究报告
```

### 系统管理命令

```
/market_insight    - 查看市场洞察（兼容旧版）
/defi_insight      - 查看 DeFi 洞察（兼容旧版）
```

### 测试命令（仅测试环境）

```
/simulate_insight  - 模拟内容洞察事件
/simulate_research - 模拟深度搜索事件
/stress_test       - 系统压力测试
```

## 🔧 部署说明

### 1. 环境变量配置

```bash
# 必需的环境变量
TELEGRAM_TOKEN=your_telegram_bot_token
USER_CHAT_ID=your_telegram_chat_id

# 可选的环境变量
X_USER_ID=your_x_user_id           # X 平台用户 ID
ENABLE_TEST_EVENTS=true            # 启用测试事件模拟
ENABLE_TEST_CONTENT=true           # 启用测试内容模拟
```

### 2. 快速启动

```bash
# 启动增强版 Telegram 机器人测试系统
npm run test:enhanced-telegram
```

或者在代码中：

```typescript
import { enableEnhancedTelegramModule } from "@/src/modules/tg";

const agent = new Agent({ /* 配置 */ });
const telegramBot = await enableEnhancedTelegramModule(agent);
```

### 3. 集成其他模块

```typescript
// 完整的系统集成
import { enableContentProcessModule } from "@/src/modules/contentProcess";
import { enableXCrawlerModule } from "@/src/modules/xContentCrawler";
import { enableEnhancedTelegramModule } from "@/src/modules/tg";

// 启用内容处理
const contentProcessor = await enableContentProcessModule(agent, userId);

// 启用 X 内容爬虫
const xCrawler = enableXCrawlerModule(agent, userId);

// 启用增强版 Telegram 机器人
const telegramBot = await enableEnhancedTelegramModule(agent);
```

## 🔔 自动通知

系统会在以下情况自动发送通知：

1. **发现有价值内容**: 当内容评估模块识别到有价值的信息时
2. **深度研究完成**: 当 Perplexity 搜索完成时
3. **投资组合更新**: 当投资组合发生变化时
4. **系统状态报告**: 定期发送系统运行状态

## 🛡️ 安全特性

- **命令冷却机制**: 防止频繁调用影响性能
- **会话管理**: 自动清理过期会话数据
- **错误处理**: 优雅处理各种异常情况
- **输入验证**: 验证用户输入的合法性

## 🎨 用户体验提升

- **富文本格式**: 使用 Markdown 格式化消息
- **图标和表情**: 丰富的视觉元素
- **分类展示**: 结构化的信息展示
- **快速响应**: 显示"正在输入"状态

## 🔄 向后兼容

增强版完全兼容原有的命令和功能：

- 保留所有原有命令
- 支持原有的事件监听
- 兼容现有的配置方式

## 📊 性能监控

- 实时系统状态监控
- 自动性能报告
- 会话使用统计
- 命令执行统计

## 🚀 未来规划

- [ ] 多语言支持
- [ ] 语音消息处理
- [ ] 图表生成功能
- [ ] 更多加密货币数据源
- [ ] 高级投资分析工具
- [ ] 用户个性化设置
- [ ] 群组管理功能

---

**注意**: 这个增强版 Telegram 机器人需要配合内容处理模块和 X 内容爬虫模块使用，才能发挥最大效果。
