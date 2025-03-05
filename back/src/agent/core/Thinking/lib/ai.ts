import { createOpenAI } from "@ai-sdk/openai";
import dotenv from "dotenv";

dotenv.config();

export type Model = "small" | "medium" | "large" | "xlarge" | "reason";
export type Platform = "qwen" | "openai" | "deepseek" | "atoma";

// 模型映射接口
interface ModelMapping {
  [key: string]: {
    [size in Model]?: string;
  };
}

// 定义各平台的模型映射
const MODEL_MAPPING: ModelMapping = {
  qwen: {
    small: "qwen-turbo",
    medium: "qwen-plus",
    large: "qwen-max",
    xlarge: "qwen-max",
    reason: "qwen-max",
  },
  openai: {
    small: "gpt-4o-mini",
    medium: "gpt-4o-mini",
    large: "gpt-4o",
    xlarge: "gpt-4-vision-preview",
    reason: "gpt-o3-mini",
  },
  // deepseek: {
  //   small: "deepseek-chat",
  //   medium: "deepseek-chat",
  //   large: "deepseek-chat",
  //   xlarge: "deepseek-chat",
  //   reason: "deepseek-reasoner",
  // },
  deepseek: {
    small: "deepseek-r1-250120",
    medium: "deepseek-r1-250120",
    large: "deepseek-r1-250120",
    xlarge: "deepseek-r1-250120",
    reason: "deepseek-r1-250120",
  },
  atoma: {
    small: "meta-llama/Llama-3.3-70B-Instruct",
    medium: "meta-llama/Llama-3.3-70B-Instruct",
    large: "deepseek-ai/DeepSeek-R1",
    xlarge: "deepseek-ai/DeepSeek-R1",
    reason: "deepseek-ai/DeepSeek-R1",
  },
};

const defaultSelect: Platform = "qwen";
const defaultVersion: Model = "large";

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

const qwen = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
  compatibility: "compatible", // strict mode, enable when using the OpenAI API
});

// const deepseek = createOpenAI({
//   baseURL: "https://api.deepseek.com",
//   apiKey: process.env.DEEPSEEK_API_KEY,
//   compatibility: "compatible", // strict mode, enable when using the OpenAI API
// });

const deepseek = createOpenAI({
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  apiKey: process.env.HUOSHAN_API_KEY,
  compatibility: "compatible", // strict mode, enable when using the OpenAI API
});

export function getProvider({
  provider = defaultSelect,
}: {
  provider: Platform;
}) {
  switch (provider) {
    case "qwen":
      return qwen;
    case "openai":
      return openai;
    case "deepseek":
      return deepseek;
    default:
      return qwen;
  }
}

export function getModel({
  inputModel = defaultVersion,
  provider = defaultSelect,
}: {
  inputModel: Model;
  provider: Platform;
}): string {
  const modelConfig = MODEL_MAPPING[provider];
  if (!modelConfig) {
    throw new Error(`Unsupported platform: ${provider}`);
  }

  const modelName = modelConfig[inputModel];
  if (!modelName) {
    throw new Error(
      `Unsupported model version ${inputModel} for platform ${provider}`
    );
  }

  return modelName;
}
