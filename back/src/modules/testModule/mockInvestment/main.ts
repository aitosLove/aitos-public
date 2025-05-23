import { Agent } from "@/src/agent";
import { DefaultSensing } from "@/src/agent/core/Sensing";
import { NullDatabase } from "@/src/agent/core/Store";
import { enableInvestmentManagerModule } from "./project_scout_module";
import { enableAnalystModule } from "./project_analysis_module";
import { enableInvestmentPartnerModule } from "./investment_partner_module";

/**
 * 设置投资系统 - 创建三个有明确分工的智能体
 * 投资经理: 发掘项目、沟通、准备材料
 * 分析师: 分析项目、撰写报告、参与汇报
 * 合伙人: 听取汇报、做出投资决策
 */
export function setupInvestmentSystem() {
  console.log("设置投资系统...");

  // 创建共享的感知层，用于智能体间通信
  const sharedDb = new NullDatabase();
  const groupSensing = new DefaultSensing({
    db: sharedDb,
    sensingId: "investment-system-group-sensing",
  });

  // 创建投资经理智能体
  const investmentManagerAgent = new Agent({
    db: new NullDatabase(),
    groupSensing, // 注入共享感知层
  });

  // 创建分析师智能体
  const analystAgent = new Agent({
    db: new NullDatabase(),
    groupSensing, // 注入相同的共享感知层
  });

  // 创建合伙人智能体
  const partnerAgent = new Agent({
    db: new NullDatabase(),
    groupSensing, // 注入相同的共享感知层
  });

  // 在各智能体上启用相应模块
  const managerModule = enableInvestmentManagerModule(investmentManagerAgent);
  const analystModule = enableAnalystModule(analystAgent);
  const partnerModule = enableInvestmentPartnerModule(partnerAgent);

  // 提供控制接口
  return {
    investmentManagerAgent,
    analystAgent,
    partnerAgent,
    managerModule,
    analystModule,
    partnerModule,

    // 显示所有智能体的状态
    showAllStatus: () => {
      console.log("\n==== 投资系统状态 ====");
      console.log("--- 投资经理状态 ---");
      managerModule.showStatus();
      console.log("\n--- 项目分析师状态 ---");
      analystModule.showStatus();
      console.log("\n--- 投资合伙人状态 ---");
      partnerModule.showStatus();
    },

    // 关闭所有模块
    teardownAll: () => {
      managerModule.teardown();
      analystModule.teardown();
      partnerModule.teardown();
      console.log("所有投资模块已关闭");
    },
  };
}

// After your existing code, add this CLI implementation
import * as readline from "readline";

// Enhance the investment system with CLI capabilities
function enhanceWithCLI(system: ReturnType<typeof setupInvestmentSystem>) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n==== 投资系统 CLI ====");
  console.log("输入以下命令:");
  console.log("status - 查看所有智能体状态");
  console.log("manager - 只查看投资经理状态");
  console.log("analyst - 只查看分析师状态");
  console.log("partner - 只查看合伙人状态");
  console.log("exit - 退出系统");

  const promptUser = () => {
    rl.question("> ", (cmd) => {
      switch (cmd.trim().toLowerCase()) {
        case "status":
          system.showAllStatus();
          break;
        case "manager":
          console.log("--- 投资经理状态 ---");
          system.managerModule.showStatus();
          break;
        case "analyst":
          console.log("--- 项目分析师状态 ---");
          system.analystModule.showStatus();
          break;
        case "partner":
          console.log("--- 投资合伙人状态 ---");
          system.partnerModule.showStatus();
          break;
        case "exit":
          system.teardownAll();
          rl.close();
          process.exit(0);
          return;
        default:
          console.log("未知命令，请重试");
      }
      promptUser();
    });
  };

  return {
    startCLI: promptUser,
  };
}

// Use the investment system with CLI
const investmentSystem = setupInvestmentSystem();
const cli = enhanceWithCLI(investmentSystem);

// Start the CLI instead of just using setTimeout
cli.startCLI();

// You can still keep the timeout if you want an automatic status check
// even if no commands are entered
// setTimeout(() => investmentSystem.showAllStatus(), 60000);
