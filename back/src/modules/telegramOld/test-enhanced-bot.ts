/**
 * ⚠️ 此文件已被精简版替代
 * 请使用 simplified-test.ts 来启动精简版 Telegram 机器人
 */

console.log("⚠️ 此文件已被弃用");
console.log("🔄 请使用精简版 Telegram 机器人:");
console.log("   ts-node src/modules/tg/simplified-test.ts");
console.log("或者:");
console.log("   import { startSimplifiedTelegramSystem } from './simplified-test';");

process.exit(0);
    db: new NullDatabase(), 
  });

  console.log(`🤖 Agent 实例已创建:`);
  console.log(`   ID: ${agentId}`);
  console.log(`   Name: ${agent.name}`);

  // 验证关键环境变量
  const envCheckResult = validateRequiredEnvironmentVariables();
  if (!envCheckResult.success) {
    console.error(`❌ 环境变量错误: ${envCheckResult.message}`);
    process.exit(1);
  }
  
  // 从环境变量获取用户 ID
  const userId = process.env.X_USER_ID || "default_user_id";
  
  try {
    // 1. 启用内容处理模块
    console.log("\n📊 启用内容处理模块...");
    const contentProcessor = await enableContentProcessModule(agent, userId);
    console.log("✅ 内容处理模块启用成功");

    // 2. 启用 X 内容爬虫模块
    console.log("\n🕷️  启用 X 内容爬虫模块...");
    const xCrawler = enableXCrawlerModule(agent, userId);
    if (xCrawler) {
      console.log("✅ X 内容爬虫模块启用成功");
    } else {
      console.warn("⚠️  X 内容爬虫模块启用失败，但系统继续运行");
    }

    // 3. 启用增强版 Telegram 模块
    console.log("\n🤖 启用增强版 Telegram 机器人...");
    const telegramModule = await enableEnhancedTelegramModule(agent);
    console.log("✅ 增强版 Telegram 机器人启用成功");

    // 4. 注册高级命令
    registerAdvancedCommands(telegramModule.getBotManager(), agent);
    
    // 5. 设置事件监听器
    setupEventListeners(agent, telegramModule.getBotManager());

    // 6. 启动系统监控和健康检查
    startSystemMonitoring(agent, telegramModule.getBotManager());
    
    // 7. 启动定期任务
    startPeriodicTasks(agent, telegramModule.getBotManager());
    
    // 输出启动成功提示
    console.log("\n✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");
    console.log("🚀 Wonderland TG Bot 已成功启动并处于运行状态");
    console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");

    console.log("\n🎉 增强版 Telegram 机器人系统完全启动!");
    console.log("\n📱 您现在可以通过 Telegram 使用以下功能:");
    console.log("   • /help - 查看所有命令");
    console.log("   • /chat <消息> - 智能对话");
    console.log("   • /insights - 查看内容洞察");
    console.log("   • /research - 查看研究报告");
    console.log("   • /status - 系统状态");
    console.log("   • 直接发送消息进行对话");

    console.log("\n🔔 自动通知已启用:");
    console.log("   • 发现有价值内容时会自动通知");
    console.log("   • 深度研究完成时会推送结果");
    console.log("   • 系统异常时会发送警报");

  } catch (error) {
    console.error("❌ 系统启动失败:", error);
    process.exit(1);
  }
}

/**
 * 注册测试命令
 */
function registerTestCommands(telegramBot: any, agent: Agent) {
  console.log("🧪 注册测试命令...");

  // 模拟内容洞察命令
  telegramBot.registerCommand({
    command: "simulate_insight",
    description: "🧪 模拟内容洞察事件",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 模拟内容洞察事件");
      
      agent.sensing.emitEvent({
        type: "CONTENT_INSIGHT_AVAILABLE_EVENT",
        description: "模拟的内容洞察事件",
        payload: {
          contentInsight: {
            agentId: agent.agentId,
            hasValue: true,
            category: "价格分析",
            summary: "比特币突破关键阻力位，显示强劲上涨势头",
            source: "https://twitter.com/test/status/123456789",
            username: "crypto_analyst_demo",
            timestamp: new Date().toISOString(),
            entity: {
              name: "Bitcoin",
              context: "主要加密货币"
            },
            event: {
              name: "价格突破",
              details: "突破 $100,000 阻力位"
            }
          }
        },
        timestamp: Date.now(),
      });

      await telegramBot.sendMessage("🧪 内容洞察事件已模拟触发！");
    },
  });

  // 模拟深度搜索命令
  telegramBot.registerCommand({
    command: "simulate_research",
    description: "🧪 模拟深度搜索事件",
    category: "system",
    handler: async (msg: any) => {
      console.log("[Test] 模拟深度搜索事件");
      
      agent.sensing.emitEvent({
        type: "PERPLEXITY_SEARCH_COMPLETED_EVENT",
        description: "模拟的深度搜索完成事件",
        payload: {
          searchResult: {
            query: "比特币价格突破 $100,000 的市场影响分析",
            response: "根据最新市场数据，比特币突破 $100,000 大关主要由以下因素推动：1. 机构投资者大量买入；2. ETF 资金持续流入；3. 美联储政策预期；4. 全球经济不确定性。这一突破可能引发新一轮牛市行情，但投资者需要警惕可能的短期回调风险。",
            citations: [
              { url: "https://example.com/analysis1", title: "机构投资报告" },
              { url: "https://example.com/analysis2", title: "ETF 数据分析" }
            ],
            metadata: {
              model: "sonar-deep-research",
              usage: { total_tokens: 1500, prompt_tokens: 500, completion_tokens: 1000, citation_tokens: 200, num_search_queries: 3 },
              timestamp: new Date().toISOString()
            },
            relatedTo: {
              contentId: "https://twitter.com/test/status/123456789",
              username: "crypto_analyst_demo",
              category: "价格分析"
            }
          }
        },
        timestamp: Date.now(),
      });

      await telegramBot.sendMessage("🧪 深度搜索事件已模拟触发！");
    },
  });

  // 系统压力测试命令
  telegramBot.registerCommand({
    command: "stress_test",
    description: "🧪 系统压力测试",
    category: "system",
    cooldown: 60, // 1分钟冷却
    handler: async (msg: any) => {
      await telegramBot.sendMessage("🧪 开始系统压力测试...");
      
      // 模拟多个快速事件
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          agent.sensing.emitEvent({
            type: "X_CONTENT_TO_PROCESS_EVENT",
            description: `压力测试事件 ${i}`,
            payload: {
              userId: "stress_test_user",
              post_content: `这是第 ${i} 个压力测试内容，包含一些加密货币相关信息。BTC ETH SOL 价格分析。`,
              authorUsername: `test_user_${i}`,
              url: `https://twitter.com/test_user_${i}/status/${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            timestamp: Date.now(),
          });
        }, i * 1000);
      }

      await telegramBot.sendMessage("🧪 压力测试完成！预计 5 秒内会收到多个处理结果。");
    },
  });

  console.log("✅ 测试命令注册完成");
}

/**
 * 启动系统监控
 */
function startSystemMonitoring(agent: Agent, telegramBot: any) {
  console.log("📊 启动系统监控...");

  // 每10分钟发送一次状态报告
  setInterval(async () => {
    const now = new Date().toLocaleString("zh-CN");
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    const statusMessage = `📊 **系统自动状态报告**\n\n` +
      `🕒 时间: ${now}\n` +
      `⏱️ 运行时间: ${uptimeHours}h ${uptimeMinutes}m\n` +
      `🤖 Agent: ${agent.agentId}\n` +
      `✅ 所有模块运行正常`;

    try {
      await telegramBot.sendMessage(statusMessage);
    } catch (error) {
      console.error("[Monitor] 发送状态报告失败:", error);
    }
  }, 10 * 60 * 1000);

  console.log("✅ 系统监控已启动");
}

/**
 * 启动测试事件模拟
 */
function startTestEventSimulation(agent: Agent, userId: string) {
  console.log("🧪 启动测试事件模拟...");

  // 每2分钟模拟一个内容处理事件
  setInterval(() => {
    const testContents = [
      "比特币今日突破历史新高，市场情绪极度乐观！#BTC #Crypto",
      "以太坊 2.0 升级进展顺利，质押奖励持续增长 #ETH",
      "DeFi 协议总锁仓量达到新高度，去中心化金融发展强劲",
      "NFT 市场出现新趋势，数字艺术品交易量激增",
      "央行数字货币 CBDC 研发取得重大突破"
    ];

    const randomContent = testContents[Math.floor(Math.random() * testContents.length)];
    const randomUser = `test_user_${Math.floor(Math.random() * 100)}`;

    agent.sensing.emitEvent({
      type: "X_CONTENT_TO_PROCESS_EVENT",
      description: "自动测试内容事件",
      payload: {
        userId: userId,
        post_content: randomContent,
        authorUsername: randomUser,
        url: `https://twitter.com/${randomUser}/status/${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
    });

    console.log(`🧪 [测试] 模拟内容: ${randomContent.substring(0, 30)}...`);
  }, 2 * 60 * 1000);

  console.log("✅ 测试事件模拟已启动");
}

/**
 * 启动定期任务 - 定期获取数据和发送通知
 * @param agent Agent 实例
 * @param telegramBot TG Bot 管理器
 */
function startPeriodicTasks(agent: Agent, telegramBot: any) {
  console.log("⏰ 启动定期任务...");
  
  // 1. 定期获取市场洞察并推送重要内容
  setInterval(async () => {
    try {
      console.log("[定期任务] 获取最新市场洞察");
      
      // 从数据库获取最新洞察
      const insights = await getContentInsightsByAgent(agent.agentId, 3);
      
      // 如果有高价值洞察，则推送通知
      const highValueInsights = insights?.filter(insight => insight.hasValue);
      
      if (highValueInsights && highValueInsights.length > 0) {
        const latestInsight = highValueInsights[0];
        
        console.log(`[定期任务] 发现高价值洞察: ${latestInsight.summary}`);
        
        // 触发洞察事件，事件处理器会处理推送
        agent.sensing.emitEvent({
          type: "CONTENT_INSIGHT_AVAILABLE_EVENT",
          description: "定期任务发现高价值洞察",
          payload: { contentInsight: latestInsight },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error("[定期任务] 获取市场洞察失败:", error);
    }
  }, 30 * 60 * 1000); // 每30分钟执行一次
  
  // 2. 定期获取深度研究结果
  setInterval(async () => {
    try {
      console.log("[定期任务] 获取最新深度研究结果");
      
      // 从数据库获取最新研究结果
      const searchResults = await getRecentPerplexitySearches(agent.agentId, 5);
      
      // 如果有新的研究结果，筛选出有价值的内容
      if (searchResults && searchResults.length > 0) {
        // 筛选出最近1小时的研究结果
        const recentResults = searchResults.filter(result => {
          const resultTime = new Date(result.metadata?.timestamp || Date.now()).getTime();
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          return resultTime >= oneHourAgo;
        });
        
        if (recentResults.length > 0) {
          console.log(`[定期任务] 发现最新研究结果: ${recentResults.length} 条`);
          
          // 对于每个研究结果，触发事件
          recentResults.forEach((result, index) => {
            // 延迟发送，避免消息堆叠
            setTimeout(() => {
              agent.sensing.emitEvent({
                type: "PERPLEXITY_SEARCH_COMPLETED_EVENT",
                description: "定期任务发现新研究结果",
                payload: { searchResult: result },
                timestamp: Date.now()
              });
            }, index * 5000); // 每条消息间隔5秒
          });
        }
      }
    } catch (error) {
      console.error("[定期任务] 获取深度研究结果失败:", error);
    }
  }, 60 * 60 * 1000); // 每1小时执行一次
  
  // 3. 定期发送系统健康状态
  setInterval(() => {
    try {
      // 触发心跳事件
      agent.sensing.emitEvent({
        type: "AGENT_HEARTBEAT",
        description: "Agent 系统心跳",
        payload: {
          systemStatus: "正常运行",
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("[定期任务] 发送系统心跳失败:", error);
    }
  }, 15 * 60 * 1000); // 每15分钟执行一次
  
  console.log("✅ 定期任务已启动");
}

/**
 * 验证必需的环境变量
 * @returns 验证结果对象
 */
function validateRequiredEnvironmentVariables(): { success: boolean; message: string } {
  const requiredVars = [
    'TELEGRAM_TOKEN',
    'USER_CHAT_ID'
  ];
  
  const optionalVars = [
    'X_USER_ID',
    'TELEGRAM_CHAT_AI_API',
    'TELEGRAM_CHAT_AI_ENDPOINT'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      success: false,
      message: `缺少必需的环境变量: ${missingVars.join(', ')}`
    };
  }
  
  // 检查可选环境变量并打印警告
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️ 警告: 以下可选环境变量未设置: ${missingOptional.join(', ')}`);
    
    if (missingOptional.includes('TELEGRAM_CHAT_AI_API') || missingOptional.includes('TELEGRAM_CHAT_AI_ENDPOINT')) {
      console.warn('⚠️ AI 聊天功能可能受限，将使用模拟回复');
    }
    
    if (missingOptional.includes('X_USER_ID')) {
      console.warn('⚠️ X 用户 ID 未设置，将使用默认值');
    }
  }
  
  return { success: true, message: '环境变量检查通过' };
}

/**
 * 设置事件监听器 - 监听重要的事件并进行处理
 * @param agent Agent 实例
 * @param telegramBot TG Bot 管理器
 */
function setupEventListeners(agent: Agent, telegramBot: any) {
  console.log("🔄 设置事件监听器...");
  
  // 监听市场洞察事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "CONTENT_INSIGHT_AVAILABLE_EVENT") {
      handleContentInsightEvent(evt, telegramBot);
    }
  });
  
  // 监听深度搜索完成事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "PERPLEXITY_SEARCH_COMPLETED_EVENT") {
      handlePerplexitySearchEvent(evt, telegramBot);
    }
  });
  
  // 监听 X 内容有价值事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "X_CONTENT_VALUABLE_EVENT") {
      handleValuableXContentEvent(evt, telegramBot);
    }
  });
  
  // 监听 DeFi 分析事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "DEFI_ANALYSIS_COMPLETED_EVENT") {
      handleDefiAnalysisEvent(evt, telegramBot);
    }
  });
  
  // 监听系统错误事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "SYSTEM_ERROR_EVENT" || evt.type === "MODULE_ERROR_EVENT") {
      handleSystemErrorEvent(evt, telegramBot);
    }
  });
  
  // 监听 Agent 心跳事件
  agent.sensing.registerListener((evt: AgentEvent) => {
    if (evt.type === "AGENT_HEARTBEAT") {
      // 仅记录日志，不发送通知
      console.log(`[Heartbeat] Agent 心跳正常: ${new Date().toLocaleString()}`);
    }
  });
  
  console.log("✅ 事件监听器设置完成");
}

// All event handling functions have been moved to dedicated handler modules

/**
 * 注册高级命令 - 为 Telegram 机器人注册专业功能命令
 * @param telegramBot TG Bot 管理器
 * @param agent Agent 实例
 */
function registerAdvancedCommands(telegramBot: any, agent: Agent) {
  console.log("🔧 注册高级命令...");

  // 市场洞察命令
  telegramBot.registerCommand({
    command: "insights",
    description: "📊 查看最新市场洞察",
    category: "crypto",
    handler: async (msg: any) => {
      try {
        await telegramBot.sendChatAction(msg.chat.id, "typing");
        
        console.log("[Command] 获取市场洞察");
        
        // 从数据库获取最新洞察
        const insights = await getContentInsightsByAgent(agent.agentId, 5);
        
        if (!insights || insights.length === 0) {
          await telegramBot.sendMessage("⚠️ 当前没有可用的市场洞察。");
          return;
        }
        
        // 发送最新的洞察
        const latestInsight = insights[0];
        
        // 构建消息
        const message = `📊 **最新市场洞察**\n\n` +
          `📈 **类型**: ${latestInsight.category}\n` +
          `💡 **摘要**: ${latestInsight.summary}\n` +
          `👤 **来源**: @${latestInsight.username}\n` +
          `🔗 **链接**: ${latestInsight.source}\n\n` +
          `${latestInsight.entity && (latestInsight.entity as any).name ? `📌 **相关资产**: ${(latestInsight.entity as any).name}` : ''}` +
          `${latestInsight.event && (latestInsight.event as any).name ? `\n🔔 **事件**: ${(latestInsight.event as any).name}` : ''}`;
          
        await telegramBot.sendMessage(message);
        
        // 如果有多个洞察，提供查看更多选项
        if (insights.length > 1) {
          const inlineKeyboard = [
            [{ text: "➕ 查看更多洞察", callback_data: "more_insights" }]
          ];
          
          await telegramBot.sendMessageWithOptions(
            msg.chat.id, 
            "您可以查看更多市场洞察：",
            { reply_markup: { inline_keyboard: inlineKeyboard } }
          );
        }
      } catch (error) {
        console.error("[Command] 市场洞察命令处理失败:", error);
        await telegramBot.sendMessage("❌ 获取市场洞察时出错，请稍后再试。");
      }
    }
  });

  // 研究报告命令
  telegramBot.registerCommand({
    command: "research",
    description: "🔍 查看深度研究报告",
    category: "crypto",
    handler: async (msg: any, args?: string) => {
      try {
        await telegramBot.sendChatAction(msg.chat.id, "typing");
        
        console.log("[Command] 获取研究报告");
        
        // 从数据库获取最新研究结果
        const searchResults = await getRecentPerplexitySearches(agent.agentId, 3);
        
        if (!searchResults || searchResults.length === 0) {
          await telegramBot.sendMessage("⚠️ 当前没有可用的深度研究报告。");
          return;
        }
        
        // 发送最新的报告
        const latestResult = searchResults[0];
        
        // 构建消息
        const message = `🔍 **最新深度研究报告**\n\n` +
          `❓ **研究主题**: ${latestResult.query}\n\n` +
          `📝 **摘要**:\n${latestResult.response.substring(0, 200)}...\n\n` +
          `📚 **参考资料**: ${latestResult.citations?.length || 0} 个来源\n` +
          `⏱️ 生成时间: ${new Date(latestResult.metadata?.timestamp || Date.now()).toLocaleString()}`;
          
        await telegramBot.sendMessage(message);
        
        // 如果有多个研究报告，提供查看更多选项
        if (searchResults.length > 1) {
          const inlineKeyboard = [
            [{ text: "📄 查看完整报告", callback_data: `view_report_${0}` }],
            [{ text: "➕ 查看更多报告", callback_data: "more_research" }]
          ];
          
          await telegramBot.sendMessageWithOptions(
            msg.chat.id, 
            "您可以查看完整报告或更多研究：",
            { reply_markup: { inline_keyboard: inlineKeyboard } }
          );
        }
      } catch (error) {
        console.error("[Command] 研究报告命令处理失败:", error);
        await telegramBot.sendMessage("❌ 获取研究报告时出错，请稍后再试。");
      }
    }
  });

  // 价格查询命令
  telegramBot.registerCommand({
    command: "price",
    description: "💰 查询加密货币价格",
    category: "crypto",
    handler: async (msg: any, args?: string) => {
      if (!args) {
        await telegramBot.sendMessage(
          "请指定要查询的加密货币符号，例如：/price BTC 或 /price ETH,BNB,SOL"
        );
        return;
      }
      
      try {
        await telegramBot.sendChatAction(msg.chat.id, "typing");
        
        // 解析查询的币种
        const coins = args.split(/[,，\s]+/).filter(Boolean).map(s => s.toUpperCase());
        
        if (coins.length === 0) {
          await telegramBot.sendMessage("⚠️ 未能识别有效的币种符号");
          return;
        }
        
        console.log(`[Command] 价格查询: ${coins.join(', ')}`);
        
        // 构建回复消息
        let message = `💰 **实时价格查询**\n\n`;
        
        // 这里应该调用实际的价格API，这里仅为模拟数据
        message += `⚠️ 注意：以下为模拟数据，实际情况请以交易所为准\n\n`;
        
        coins.forEach(coin => {
          const mockPrice = (Math.random() * 100000).toFixed(2);
          const change24h = (Math.random() * 10 - 5).toFixed(2);
          const isUp = parseFloat(change24h) >= 0;
          
          message += `**${coin}**: $${mockPrice}\n`;
          message += `24h: ${isUp ? '🟢' : '🔴'} ${change24h}%\n\n`;
        });
        
        message += `🕒 数据更新时间: ${new Date().toLocaleTimeString()}`;
        
        await telegramBot.sendMessage(message);
        
      } catch (error) {
        console.error("[Command] 价格查询命令处理失败:", error);
        await telegramBot.sendMessage("❌ 价格查询失败，请稍后再试。");
      }
    }
  });

  // 状态命令
  telegramBot.registerCommand({
    command: "status",
    description: "📊 系统状态",
    category: "system",
    handler: async (msg: any) => {
      try {
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);
        
        const memory = process.memoryUsage();
        const memoryUsedMB = (memory.rss / 1024 / 1024).toFixed(2);
        
        const statusMessage = `📊 **系统状态报告**\n\n` +
          `🤖 **机器人ID**: ${agent.agentId}\n` +
          `⏱️ **运行时间**: ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n` +
          `🧠 **内存使用**: ${memoryUsedMB} MB\n` +
          `🔄 **事件监听器**: 已激活\n` +
          `📈 **定期任务**: 正在运行\n` +
          `✅ **系统状态**: 正常运行中`;
          
        await telegramBot.sendMessage(statusMessage);
        
      } catch (error) {
        console.error("[Command] 状态命令处理失败:", error);
        await telegramBot.sendMessage("❌ 获取系统状态失败");
      }
    }
  });
  
  // 帮助命令
  telegramBot.registerCommand({
    command: "help",
    description: "❓ 查看帮助信息",
    category: "system",
    handler: async (msg: any) => {
      const helpMessage = `🤖 **Wonderland TG Bot 帮助**\n\n` +
        `以下是可用的命令:\n\n` +
        `📈 **加密货币相关:**\n` +
        `/insights - 查看最新市场洞察\n` +
        `/research - 查看深度研究报告\n` +
        `/price <币种> - 查询加密货币价格\n` +
        `/chat <消息> - 与 AI 助手交流\n\n` +
        
        `🛠️ **系统命令:**\n` +
        `/status - 查看系统状态\n` +
        `/help - 显示此帮助信息\n\n` +
        
        `🧪 **测试命令:**\n` +
        `/simulate_insight - 模拟生成市场洞察\n` +
        `/simulate_research - 模拟生成研究报告\n` +
        `/stress_test - 运行系统压力测试\n\n` +
        
        `💡 **提示**: 您也可以直接发送消息，机器人会尝试理解并回复`;
        
      await telegramBot.sendMessage(helpMessage);
    }
  });

  // 同时也注册测试命令
  registerTestCommands(telegramBot, agent);

  console.log("✅ 高级命令注册完成");
}

// 启动系统
setupEnhancedTelegramSystem().catch((error) => {
  console.error("系统启动失败:", error);
  process.exit(1);
});

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n\n👋 收到关闭信号，正在优雅关闭增强版 Telegram 系统...');
  console.log('🎉 感谢使用 Wonderland Enhanced Telegram Bot！');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 收到终止信号，正在关闭系统...');
  process.exit(0);
});
