/**
 * 精简版 Telegram 模块主入口
 * 替代原有复杂的 index.ts
 */

export { 
  SimplifiedTelegramBot,
  enableSimplifiedTelegramModule 
} from "./simplified-index";

export { 
  startSimplifiedTelegramSystem 
} from "./simplified-test";

// 保持向后兼容性
import { enableSimplifiedTelegramModule } from "./simplified-index";
export const enableTelegramModule = enableSimplifiedTelegramModule;
