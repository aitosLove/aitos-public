// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/index.ts
/**
 * agent/index.ts
 *
 * Defines the Agent class, integrating core modules:
 * - sensing (event perception)
 * - taskManager (task management)
 * - thinking (cognitive processing)
 * - state (status management)
 * - reflection (self-reflection)
 * - monitoring (system monitoring)
 *
 * This forms "an Agent instance" that external systems can call methods on, or inject into modules.
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
  groupSensing?: ISensing; // Shared perception layer
  agentId?: string; // Unique agentId for multi-instance lookup
  name?: string; // Name of the agent
}

export class Agent {
  // Core components exposed to the outside world

  public sensing: ISensing; // Event perception
  public groupSensing: ISensing; // Large perception layer shared by all Agents

  public taskManager: TaskManager; // Task management
  public thinking: IThinking; // Thinking
  public state: IState; // Default state
  public reflection: IReflection; // Reflection
  // public monitoring: IMonitoring; // Monitoring
  public agentId: string; // Unique agentId for multi-instance lookup
  public db: IDatabase; // Database instance
  public name: string; // Name of the agent

  constructor(options: AgentOptions = {}) {
    // 1. Generate a unique agentId
    this.agentId = options.agentId || uuidV4();

    // 2. Set agent name
    this.name = options.name || `Agent-${this.agentId.slice(0, 8)}`;

    // Use provided database or create a null implementation
    this.db = options.db || new NullDatabase();

    // 1. Initialize perception layer
    this.sensing = new DefaultSensing({ db: this.db });

    // Shared perception layer, if not passed during initialization, Agent creates its own group
    this.groupSensing =
      options.groupSensing ||
      new DefaultSensing({
        db: this.db,
      });

    // 2. Initialize task management (inject sensing for event emission)
    this.taskManager = new TaskManager(this.sensing, this.db);

    // 3. Initialize other default modules
    this.thinking = new DefaultThinking();
    this.state = new DefaultState();
    this.reflection = new DefaultReflection();
    // this.monitoring = new DefaultMonitoring();

    // // 4. Optional: Add core modules' getStatus() to monitoring
    // //    to see their status in getOverallStatus()
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
