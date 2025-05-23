/**
 * agent/index.ts
 *
 * 定义 Agent 类，整合核心模块：
 * - sensing (事件感知)
 * - taskManager (任务管理)
 * - thinking (思维)
 * - state (状态)
 * - reflection (反射)
 * - monitoring (监控)
 *
 * 这样就形成“一个Agent实例”，外部可调用其方法，也可将其注入模块中。
 */

import { DefaultSensing, ISensing } from "./core/Sensing";
import { TaskManager } from "./core/TaskManager";
import { DefaultThinking, IThinking } from "./core/Thinking";
import { DefaultState, IState } from "./core/State";
import { DefaultReflection, IReflection } from "./core/Reflection";
import { IDatabase, NullDatabase } from "./core/Store";
import { v4 as uuidV4 } from "uuid";
// import { DefaultMonitoring, IMonitoring } from "./core/Monitoring";

export interface AgentOptions {
  db?: IDatabase;
  groupSensing?: ISensing; // 共享的感知层
  agentId?: string; // 唯一的 agentId，用于多实例检索
  name?: string; // agent的名字
}

export class Agent {
  // 暴露给外界的核心组件

  public sensing: ISensing; // 事件感知
  public groupSensing: ISensing; // 所有 Agent共用的大感知层

  public taskManager: TaskManager; // 任务管理
  public thinking: IThinking; // 思维
  public state: IState; // 默认状态
  public reflection: IReflection; // 反射
  // public monitoring: IMonitoring; // 监控
  public agentId: string; // 唯一的 agentId，用于多实例检索
  public db: IDatabase; // 数据库实例
  public name: string; // agent的名字

  constructor(options: AgentOptions = {}) {
    // 1. 生成唯一的 agentId
    this.agentId = options.agentId || uuidV4();

    // 2. 设置 agent 名字
    this.name = options.name || `Agent-${this.agentId.slice(0, 8)}`;

    // 使用提供的数据库或创建空实现
    this.db = options.db || new NullDatabase();

    // 1. 初始化感知层
    this.sensing = new DefaultSensing({ db: this.db });

    // 共享感知层，如果初始化没有传入，则 Agent 自己拉一个群
    this.groupSensing =
      options.groupSensing ||
      new DefaultSensing({
        db: this.db,
      });

    // 2. 初始化任务管理 (需要注入sensing, 用于发事件)
    this.taskManager = new TaskManager(this.sensing, this.db);

    // 3. 初始化其他默认模块
    this.thinking = new DefaultThinking();
    this.state = new DefaultState();
    this.reflection = new DefaultReflection();
    // this.monitoring = new DefaultMonitoring();

    // // 4. 可选：把核心模块的 getStatus() 也加到 monitoring 中
    // //    以便在 getOverallStatus() 里看到它们的状态
    // this.monitoring.addModuleStatusGetter("core_sensing", () =>
    //   this.sensing.getStatus()
    // );
    // this.monitoring.addModuleStatusGetter("core_taskManager", () => ({
    //   totalTasks: this.taskManager.getTasks().length,
    // }));
    // this.monitoring.addModuleStatusGetter("core_thinking", () =>
    //   this.thinking.getStatus()
    // );
    // this.monitoring.addModuleStatusGetter("core_state", () =>
    //   this.state.getStatus()
    // );
    // this.monitoring.addModuleStatusGetter("core_reflection", () =>
    //   this.reflection.getStatus()
    // );

    this.on();
  }

  on() {
    setInterval(() => {
      // console.log("HEARTBEAT");
      this.sensing.emitEvent({
        type: "HEARTBEAT_EVENT",
        description: "HEARTBEAT",
        payload: {},
        timestamp: Date.now(),
      });
    }, 6000_000);
  }
}
