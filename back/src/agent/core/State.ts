/**
 * State.ts
 *
 * Agent 的默认状态管理。
 * 提供简单的内存存储，也可扩展成 DB、Redis 等。
 */

export interface IState {
  get(key: string): any;
  set(key: string, value: any): void;
  getStatus(): any;
  showStatus(): void;
}

/** 默认状态实现 (仅内存) */
export class DefaultState implements IState {
  private store: Record<string, any> = {};

  get(key: string): any {
    return this.store[key];
  }

  set(key: string, value: any): void {
    this.store[key] = value;
  }

  getStatus() {
    return {
      storedKeys: Object.keys(this.store).length,
      snapshot: { ...this.store },
    };
  }
  showStatus() {
    console.log("State Status:");
    console.log("- Stored keys:", Object.keys(this.store).length);
    console.log("- Snapshot:", JSON.stringify(this.store, null, 2));
  }
}
