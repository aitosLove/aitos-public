/**
 * 配置示例文件
 * 复制这个文件到项目根目录的 .env 文件中
 */

export const TELEGRAM_CONFIG_EXAMPLE = `
# Telegram Bot配置
TELEGRAM_TOKEN=your_telegram_bot_token_here
USER_CHAT_ID=your_telegram_chat_id_here

# AI服务配置
QWEN_API_KEY=your_qwen_api_key_here
`;

/**
 * 检查必需的环境变量
 */
export function validateTelegramConfig(): {
  isValid: boolean;
  missingVars: string[];
  suggestions: string[];
} {
  const requiredVars = ['TELEGRAM_TOKEN', 'USER_CHAT_ID', 'QWEN_API_KEY'];
  const missingVars: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  const suggestions = [
    '1. 创建Telegram Bot: 与@BotFather对话，使用/newbot命令',
    '2. 获取Chat ID: 向bot发送消息，然后访问 https://api.telegram.org/bot<TOKEN>/getUpdates',
    '3. 获取Qwen API Key: 前往阿里云DashScope申请API密钥',
    '4. 在项目根目录创建.env文件并添加配置'
  ];
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    suggestions
  };
}
