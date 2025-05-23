import { AgentTask } from "@/src/agent/core/AgentTask";

/**
 * 投资项目信息
 */
export interface ProjectInfo {
  projectId: string;
  name: string;
  industry: string;
  fundingStage: string;
  askingAmount: number;
  description: string;
  timestamp: number;
  sourceManager: string; // 发现项目的投资经理ID
}

/**
 * 分析报告
 */
export interface AnalysisReport {
  projectId: string;
  analyst: string;
  financialAnalysis: string;
  marketAnalysis: string;
  riskAnalysis: string;
  recommendationScore: number; // 1-10分
  timestamp: number;
}

/**
 * 投资提案
 */
export interface InvestmentProposal {
  projectId: string;
  manager: string;
  projectSummary: string;
  proposedInvestmentAmount: number;
  expectedReturn: string;
  supportingAnalysis: string; // 基于分析师报告
  timestamp: number;
}

/**
 * 投资决策
 */
export interface InvestmentDecision {
  projectId: string;
  partner: string;
  approved: boolean;
  approvedAmount: number;
  comments: string;
  timestamp: number;
}

// 任务类型定义
export type ProjectDiscoveryTask = AgentTask<ProjectInfo>;
export type AnalysisTask = AgentTask<ProjectInfo>;
export type ReportTask = AgentTask<AnalysisReport>;
export type ProposalTask = AgentTask<{
  report: AnalysisReport;
  project: ProjectInfo;
}>;
export type PresentationTask = AgentTask<InvestmentProposal>;
export type DecisionTask = AgentTask<{
  proposal: InvestmentProposal;
  report: AnalysisReport;
}>;

// 事件类型常量
export const EVENT_TYPES = {
  PROJECT_DISCOVERED: "PROJECT_DISCOVERED",
  ANALYSIS_REQUESTED: "ANALYSIS_REQUESTED",
  ANALYSIS_COMPLETED: "ANALYSIS_COMPLETED",
  PROPOSAL_CREATED: "PROPOSAL_CREATED",
  PRESENTATION_SCHEDULED: "PRESENTATION_SCHEDULED",
  DECISION_MADE: "DECISION_MADE",
};
