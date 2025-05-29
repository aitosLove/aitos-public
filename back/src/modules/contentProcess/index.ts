import { Agent } from "@/src/agent";
import { ContentEvaluationManager } from "./contentEvalModule";

/**
 * 启用内容处理模块
 * @param agent Agent 实例
 * @param userId 用户 ID
 * @returns ContentEvaluationManager 实例
 */
export async function enableContentProcessModule(
  agent: Agent,
  userId: string
): Promise<ContentEvaluationManager> {
  const contentEvaluationManager = new ContentEvaluationManager(agent, userId);
  await contentEvaluationManager.init();
  
  console.log(`[ContentProcess] 内容处理模块已启用，Agent ID: ${agent.agentId}, 用户ID: ${userId}`);
  
  return contentEvaluationManager;
}

// 导出相关类和类型
export { ContentEvaluationManager } from "./contentEvalModule";
export { ContentEvaluator } from "./contentEvaluator";
export * from "./ContentDbOp";
