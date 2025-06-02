/**
 * Sensing.ts
 *
 * Interface and default implementation for the perception layer.
 * - Provides the external registerListener(fn) method to register listeners
 * - Allows emitEvent(evt) to publish events to the system
 * - registerListener returns a function that callers can use to remove the listener
 *
 * This implements a "unified event center" where modules can interact through events.
 */

import { AgentEvent } from "./EventTypes";
import { IDatabase } from "./Store";

/** Perception layer interface */
export interface ISensing {
  /**
   * Register an event listener function
   * @param fn Listener callback (evt: AgentEvent) => void
   * @returns A cleanup function to remove this listener
   */
  registerListener(fn: (evt: AgentEvent) => void): () => void;

  /**
   * Emit an event. All listeners in the system will receive this event
   * @param evt AgentEvent
   */
  emitEvent(evt: AgentEvent): void;

  /**
   * Get the current state of the perception layer (for monitoring)
   */
  getStatus(): any;

  showStatus(): void;
}

/** Perception layer configuration options */
export interface SensingOptions {
  /** Database instance */
  db: IDatabase;
  /** Sensing ID, used to differentiate between different perception layers */
  sensingId?: string;
}

/** Default implementation of the perception layer */
export class DefaultSensing implements ISensing {
  /** Internally maintains an array of listeners */
  private listeners: Array<(evt: AgentEvent) => void> = [];
  /** Database instance */
  private db: IDatabase;

  /** Sensing ID, used to differentiate between different perception layers */
  private sensingId: string;

  /**
   * Constructor, receives perception layer configuration options
   * @param options Perception layer configuration options
   */
  constructor(options: SensingOptions) {
    this.db = options.db;
    this.sensingId = options.sensingId || "default-sensing";
  }

  registerListener(fn: (evt: AgentEvent) => void): () => void {
    this.listeners.push(fn);

    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  }

  emitEvent(evt: AgentEvent): void {
    // Call all registered listeners in sequence
    this.listeners.forEach((listener) => listener(evt));

    // Save the event using the database
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

  /** Output the current status of listeners */
  showStatus() {
    console.log(`Sensing Status:`);
    console.log(`- Listener count: ${this.listeners.length}`);
    console.log(`- Registered listeners:`);
    this.listeners.forEach((listener, idx) => {
      console.log(`  ${idx + 1}: ${listener.toString()}`);
    });
  }
}
