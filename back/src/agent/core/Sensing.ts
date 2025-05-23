/**
 * Sensing.ts
 *
 * 感知层接口与默认实现。
 * - 提供对外的 registerListener(fn) 方法，用来注册监听器
 * - 允许 emitEvent(evt) 向系统发布事件
 * - registerListener 返回一个函数，可供调用者移除该监听器
 *
 * 这样就实现了"统一的事件中心"，各模块可通过该中心进行事件交互。
 */

import { AgentEvent } from "./EventTypes";
import { IDatabase } from "./Store";

/** 感知层接口 */
export interface ISensing {
  /**
   * 注册一个事件监听函数
   * @param fn 监听器回调 (evt: AgentEvent) => void
   * @returns 一个关闭函数，用来移除这个监听器
   */
  registerListener(fn: (evt: AgentEvent) => void): () => void;

  /**
   * 发出一个事件。系统内所有监听器都会收到该事件
   * @param evt AgentEvent
   */
  emitEvent(evt: AgentEvent): void;

  /**
   * 获取当前感知层的状态 (供监控使用)
   */
  getStatus(): any;

  showStatus(): void;
}

/** 感知层配置选项 */
export interface SensingOptions {
  /** 数据库实例 */
  db: IDatabase;
  /** 感知ID，用于区分不同的感知层 */
  sensingId?: string;
}

/** 默认的感知层实现 */
export class DefaultSensing implements ISensing {
  /** 内部维护一个监听器数组 */
  private listeners: Array<(evt: AgentEvent) => void> = [];
  /** 数据库实例 */
  private db: IDatabase;

  /** 感知ID，用于区分不同的感知层 */
  private sensingId: string;

  /**
   * 构造函数，接收感知层配置选项
   * @param options 感知层配置选项
   */
  constructor(options: SensingOptions) {
    this.db = options.db;
    this.sensingId = options.sensingId || "default-sensing";
  }

  registerListener(fn: (evt: AgentEvent) => void): () => void {
    this.listeners.push(fn);

    // 返回一个函数，用于移除该listener
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  }

  emitEvent(evt: AgentEvent): void {
    // 依次调用所有注册的监听器
    this.listeners.forEach((listener) => listener(evt));

    // 使用数据库保存事件
    this.db.saveEvent({
      name: evt.type,
      description: evt.description,
      // agentId: evt.agentId,
    });
  }

  getStatus() {
    return {
      listenerCount: this.listeners.length,
    };
  }

  /** 输出当前监听器的状态 */
  showStatus() {
    console.log(`Sensing Status:`);
    console.log(`- Listener count: ${this.listeners.length}`);
    console.log(`- Registered listeners:`);
    this.listeners.forEach((listener, idx) => {
      console.log(`  ${idx + 1}: ${listener.toString()}`);
    });
  }
}
