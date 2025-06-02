// filepath: /Users/ryuko/dev/24531/wonderland-v2/back/src/agent/core/Reflection.ts
/**
 * Reflection.ts
 *
 * Reflection layer, used for emergency or quick response scenarios.
 * It bypasses the normal task or event flow, directly calling relevant interfaces.
 */

export interface IReflection {
  /** Emergency shutdown or other quick response operations */
  shutdown(): void;

  getStatus(): any;
  showStatus(): void;
}

/** Default reflection implementation */
export class DefaultReflection implements IReflection {
  shutdown(): void {
    console.log("[DefaultReflection] immediate shutdown triggered!");
    // You can perform quick actions here such as: closing all tasks or sending system stop signals
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
