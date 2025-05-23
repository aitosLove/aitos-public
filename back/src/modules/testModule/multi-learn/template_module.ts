import { AgentTask } from "@/src/agent/core/AgentTask";
import { Agent } from "@/src/agent";
import { AgentEvent } from "@/src/agent/core/EventTypes";
import cron from "node-cron";

// 数据生产者模块的载荷定义
export interface RawDataPayload {
  dataId: string;
  sourceAgent: string;
  rawValue: number;
  timestamp: number;
}

export type RawDataTask = AgentTask<RawDataPayload>;

/**
 * 数据生产者模块 - 负责生成原始数据并发布到共享感知层
 * 这个模块应该只安装在Agent1上
 */
class DataProducerModule {
  private agent: Agent;
  private offListeners: Array<() => void> = [];
  private dataCounter: number = 0;
  private producedData: RawDataPayload[] = [];

  constructor(agent: Agent) {
    this.agent = agent;
  }

  init() {
    console.log(`[DataProducer] 初始化，安装在Agent: ${this.agent.agentId}`);

    // 设置定时生产数据的任务
    this.setupDataProduction();

    // 监听其他Agent对数据的处理结果
    const offProcessedListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "PROCESSED_DATA_EVENT") {
          console.log(
            `[DataProducer ${
              this.agent.agentId
            }] 收到处理结果: ${JSON.stringify(evt.payload)}`
          );
          // 可以在这里记录哪些数据被处理了
        }
      }
    );

    this.offListeners.push(offProcessedListener);
  }

  setupDataProduction() {
    // 每10秒生成一次数据
    cron.schedule("*/10 * * * * *", () => {
      this.produceData();
    });
  }

  produceData() {
    this.dataCounter++;
    const dataId = `data-${Date.now()}-${this.dataCounter}`;

    // 创建原始数据处理任务
    const task = this.agent.taskManager.createTask<RawDataPayload>({
      type: "GENERATE_RAW_DATA",
      description: `生成原始数据 ${dataId}`,
      payload: {
        dataId,
        sourceAgent: this.agent.agentId,
        rawValue: Math.random() * 100,
        timestamp: Date.now(),
      },
      callback: (payload) => {
        console.log(
          `[DataProducer ${this.agent.agentId}] 生成数据: ${payload.dataId}, 值: ${payload.rawValue}`
        );

        // 保存已生成的数据
        this.producedData.push(payload);

        // 发布到共享感知层，让数据处理者模块可以接收到
        this.agent.groupSensing.emitEvent({
          type: "RAW_DATA_EVENT",
          payload,
          timestamp: Date.now(),
          description: `由Agent ${this.agent.agentId} 生成的原始数据`,
        });

        return `成功生成数据: ${dataId}`;
      },
    });
  }

  showStatus() {
    console.log(`[DataProducer ${this.agent.agentId}] 状态:`);
    console.log(`- 已生成数据量: ${this.producedData.length}`);
    console.log(`- 最近5条数据:`);
    this.producedData.slice(-5).forEach((data) => {
      console.log(`  ID: ${data.dataId}, 值: ${data.rawValue}`);
    });
  }

  teardown() {
    this.offListeners.forEach((off) => off());
    console.log(`[DataProducer ${this.agent.agentId}] 已关闭`);
  }
}

/**
 * 启用数据生产者模块
 * 这个模块应该只安装在Agent1上
 */
export function enableDataProducerModule(agent: Agent) {
  const module = new DataProducerModule(agent);
  module.init();
  console.log(`[DataProducer] 已在Agent ${agent.agentId} 上启用`);

  return {
    showStatus: () => module.showStatus(),
    teardown: () => module.teardown(),
  };
}

// ========

// 处理结果的载荷定义
export interface ProcessedDataPayload {
  originalData: RawDataPayload;
  processorAgent: string;
  processedValue: number;
  insights: string;
  processingTime: number;
}

export type ProcessDataTask = AgentTask<RawDataPayload>;
export type ReportResultTask = AgentTask<ProcessedDataPayload>;

/**
 * 数据处理者模块 - 负责接收和处理原始数据
 * 这个模块应该只安装在Agent2上
 */
class DataProcessorModule {
  private agent: Agent;
  private offListeners: Array<() => void> = [];
  private processedData: ProcessedDataPayload[] = [];

  constructor(agent: Agent) {
    this.agent = agent;
  }

  init() {
    console.log(`[DataProcessor] 初始化，安装在Agent: ${this.agent.agentId}`);

    // 监听共享感知层中的原始数据事件
    const offRawDataListener = this.agent.groupSensing.registerListener(
      (evt: AgentEvent) => {
        if (evt.type === "RAW_DATA_EVENT") {
          const payload = evt.payload as RawDataPayload;

          // 确保不处理自己生成的数据（虽然在这个架构中数据处理者不会生成数据）
          if (payload.sourceAgent !== this.agent.agentId) {
            console.log(
              `[DataProcessor ${this.agent.agentId}] 接收到来自 ${payload.sourceAgent} 的原始数据: ${payload.dataId}`
            );
            this.processData(payload);
          }
        }
      }
    );

    this.offListeners.push(offRawDataListener);
  }

  processData(rawData: RawDataPayload) {
    // 创建数据处理任务
    const task = this.agent.taskManager.createTask<RawDataPayload>({
      type: "PROCESS_RAW_DATA",
      description: `处理来自 ${rawData.sourceAgent} 的数据 ${rawData.dataId}`,
      payload: rawData,
      callback: (payload) => {
        console.log(
          `[DataProcessor ${this.agent.agentId}] 开始处理数据: ${payload.dataId}`
        );

        // 模拟数据处理
        const startTime = Date.now();
        const processedValue = payload.rawValue * 1.5 + 10; // 简单转换
        const processingTime = Date.now() - startTime;

        // 创建处理结果
        const result: ProcessedDataPayload = {
          originalData: payload,
          processorAgent: this.agent.agentId,
          processedValue,
          insights: this.generateInsights(payload.rawValue),
          processingTime,
        };

        // 保存处理结果
        this.processedData.push(result);

        // 报告处理结果
        this.reportResults(result);

        return `成功处理数据 ${payload.dataId}`;
      },
    });
  }

  reportResults(result: ProcessedDataPayload) {
    // 创建报告任务
    const task = this.agent.taskManager.createTask<ProcessedDataPayload>({
      type: "REPORT_PROCESSING_RESULTS",
      description: `报告对 ${result.originalData.dataId} 的处理结果`,
      payload: result,
      callback: (payload) => {
        console.log(
          `[DataProcessor ${this.agent.agentId}] 报告处理结果: ${payload.originalData.dataId}`
        );

        // 发布处理结果到共享感知层
        this.agent.groupSensing.emitEvent({
          type: "PROCESSED_DATA_EVENT",
          payload,
          timestamp: Date.now(),
          description: `由Agent ${this.agent.agentId} 处理的数据结果`,
        });

        return `成功报告处理结果: ${payload.originalData.dataId}`;
      },
    });
  }

  generateInsights(value: number): string {
    if (value > 80) return "数值异常高，建议关注";
    if (value < 20) return "数值异常低，需要调查";
    return "数值在正常范围内";
  }

  showStatus() {
    console.log(`[DataProcessor ${this.agent.agentId}] 状态:`);
    console.log(`- 已处理数据量: ${this.processedData.length}`);
    console.log(`- 最近5条处理结果:`);
    this.processedData.slice(-5).forEach((data) => {
      console.log(
        `  原始数据ID: ${data.originalData.dataId}, 处理结果: ${data.processedValue}, 见解: ${data.insights}`
      );
    });
  }

  teardown() {
    this.offListeners.forEach((off) => off());
    console.log(`[DataProcessor ${this.agent.agentId}] 已关闭`);
  }
}

/**
 * 启用数据处理者模块
 * 这个模块应该只安装在Agent2上
 */
export function enableDataProcessorModule(agent: Agent) {
  const module = new DataProcessorModule(agent);
  module.init();
  console.log(`[DataProcessor] 已在Agent ${agent.agentId} 上启用`);

  return {
    showStatus: () => module.showStatus(),
    teardown: () => module.teardown(),
  };
}
