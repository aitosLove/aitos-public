/**
 * Monitoring.ts
 *
 * 为 Agent 提供一个可统一汇总各模块状态的监控接口。
 * - Agent核心模块 (Sensing, TaskManager, Thinking, State, Reflection)
 *   都有 getStatus() 可供使用
 * - 还可以让“可选模块”通过 addModuleStatusGetter(...) 注入自己的状态获取方法
 * - 最终 getOverallStatus() 整合所有信息
 */

export interface IMonitoring {
  /**
   * 允许动态添加模块的状态Getter
   * @param moduleName 模块名称
   * @param getter 状态获取函数
   */
  addModuleStatusGetter(moduleName: string, getter: () => any): void;

  /**
   * 返回总体状态 (核心模块 + 各模块的状态)
   */
  getOverallStatus(): any;

  showModuleStatus(moduleName: string): void;
}

export class DefaultMonitoring implements IMonitoring {
  // 用于储存“模块名 -> 获取状态函数”
  private moduleStatusGetters: Record<string, () => any> = {};

  // 此示例里，我们可能要引用Agent核心以拿到其getStatus()；
  // 也可以构造时注入 sensing, thinking 等
  // 这里演示较简化的写法：

  addModuleStatusGetter(moduleName: string, getter: () => any) {
    this.moduleStatusGetters[moduleName] = getter;
  }

  getOverallStatus(): any {
    // 先收集各个模块的状态
    const modules: Record<string, any> = {};
    for (const [name, fn] of Object.entries(this.moduleStatusGetters)) {
      modules[name] = fn();
    }

    // 返回一个汇总对象
    return {
      modules,
      timestamp: Date.now(),
    };
  }

  /** 调用模块的 showStatus 方法 */
  showModuleStatus(moduleName: string): void {
    const module = this.moduleStatusGetters[moduleName];
    if (module && typeof module().showStatus === "function") {
      module().showStatus(); // 调用模块的 showStatus 方法
    } else {
      console.log(`No showStatus method found for module: ${moduleName}`);
    }
  }
}
