/**
 * Reflection.ts
 *
 * 反射层，用于处理紧急或快速响应的场景。
 * 不走正常的任务或感知事件流程，而是直接调用相关接口。
 */

export interface IReflection {
  /** 紧急关闭或其他快速响应操作 */
  shutdown(): void;

  getStatus(): any;
  showStatus(): void;
}

/** 默认反射实现 */
export class DefaultReflection implements IReflection {
  shutdown(): void {
    console.log("[DefaultReflection] immediate shutdown triggered!");
    // 你可以在这里做如：关闭所有任务 或 发出系统停止信号 等快速动作
  }

  getStatus() {
    return {
      info: "DefaultReflection active",
    };
  }

  showStatus() {
    console.log("Reflection Status:");
    console.log("- Status: active");
  }
}
