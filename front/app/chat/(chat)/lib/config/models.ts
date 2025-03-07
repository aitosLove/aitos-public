import { Model } from "@/app/chat/(chat)/lib/types/models";
import { headers } from "next/headers";

export function validateModel(model: any): model is Model {
  return (
    typeof model.id === "string" &&
    typeof model.name === "string" &&
    typeof model.provider === "string" &&
    typeof model.providerId === "string" &&
    typeof model.enabled === "boolean" &&
    (model.toolCallType === "native" || model.toolCallType === "manual") &&
    (model.toolCallModel === undefined ||
      typeof model.toolCallModel === "string")
  );
}

export async function getModels(): Promise<Model[]> {
  try {
    const headersList = await headers();

    console.log(headersList.get("x-host"));
    let baseUrl: URL;
    if (headersList.get("x-host") == "localhost:3000") {
      // 测试情况
      baseUrl = new URL("http://localhost:3000");
    } else if (headersList.get("x-host") != null) {
      // 大多数情况，手动添加https头
      baseUrl = new URL(`https://` + headersList.get("x-host"));
    } else {
      // 例外情况，手动赋值
      baseUrl = new URL("http://localhost:3000");
    }

    // const baseUrl = new URL(
    //   `https://` + headersList.get("x-host") || "http://localhost:3000"
    // );
    const modelUrl = new URL("/config/models.json", baseUrl.origin);

    const response = await fetch(modelUrl, {
      cache: "no-store",
    });
    const config = await response.json();
    if (Array.isArray(config.models) && config.models.every(validateModel)) {
      return config.models;
    }
    console.warn("Invalid model configuration");
  } catch (error) {
    console.warn("Failed to load models:", error);
  }

  return [];
}
