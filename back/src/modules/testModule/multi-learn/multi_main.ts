import { Agent } from "@/src/agent";
import { DefaultSensing } from "@/src/agent/core/Sensing";
import {
  enableDataProcessorModule,
  enableDataProducerModule,
} from "./template_module";
import { NullDatabase } from "@/src/agent/core/Store";

/**
 * 设置协作示例 - 创建两个具有明确分工的Agent
 * Agent1: 数据生产者 - 负责生成原始数据
 * Agent2: 数据处理者 - 负责处理原始数据并报告结果
 */
export function setupCollaborationExample() {
  console.log("设置Agent协作示例...");

  // 创建共享的感知层，用于Agent间通信
  const sharedDb = new NullDatabase();
  const groupSensing = new DefaultSensing({
    db: sharedDb,
  });

  // 创建数据生产者Agent (Agent1)
  const producerAgent = new Agent({
    db: new NullDatabase(),
    groupSensing, // 注入共享感知层
  });

  // 创建数据处理者Agent (Agent2)
  const processorAgent = new Agent({
    db: new NullDatabase(),
    groupSensing, // 注入相同的共享感知层
  });

  // 在各自Agent上启用相应模块
  const producerModule = enableDataProducerModule(producerAgent);
  const processorModule = enableDataProcessorModule(processorAgent);

  // 提供控制接口
  return {
    producerAgent,
    processorAgent,
    producerModule,
    processorModule,

    // 显示所有Agent的状态
    showAllStatus: () => {
      console.log("\n==== 协作系统状态 ====");
      console.log("--- 数据生产者状态 ---");
      producerModule.showStatus();
      console.log("\n--- 数据处理者状态 ---");
      processorModule.showStatus();
    },

    // 关闭所有模块
    teardownAll: () => {
      producerModule.teardown();
      processorModule.teardown();
      console.log("所有模块已关闭");
    },
  };
}

// 使用示例
const system = setupCollaborationExample();
setTimeout(() => system.showAllStatus(), 60000);
