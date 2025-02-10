import { getProvider, getModel, Model, Platform } from "./ai";
import { generateText } from "ai";

export async function generateResponse({
  input,
  systemPrompt,
  model = "large",
  platform = "qwen",
}: {
  input: string;
  systemPrompt: string;
  model?: Model;
  platform?: Platform;
}): Promise<string> {
  const provider = getProvider({
    provider: platform,
  });

  const generatedContent = await generateText({
    model: provider(
      getModel({
        inputModel: model,
        provider: platform,
      })
    ),
    messages: [
      {
        role: "system",
        content: systemPrompt || "You are a helpful assistant.",
      },
      { role: "user", content: input },
    ],
  });

  return generatedContent.text;
}
