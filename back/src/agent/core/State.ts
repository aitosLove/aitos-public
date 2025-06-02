/**
 * State.ts
 *
 * Default state management for the Agent.
 * Provides simple in-memory storage, can be extended to use DB, Redis, etc.
 */

export interface IState {
  get(key: string): any;
  set(key: string, value: any): void;
  getStatus(): any;
  showStatus(): void;
}

/** Default state implementation (memory only) */
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
