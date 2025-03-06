import { Chat } from "@/app/(chat)/components/chat";
import { getSharedChat } from "@/app/chat/(chat)/lib/actions/chat";
import { getModels } from "@/app/chat/(chat)/lib/config/models";
import { convertToUIMessages } from "@/app/chat/(chat)/lib/utils";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const chat = await getSharedChat(id);

  if (!chat || !chat.sharePath) {
    return notFound();
  }

  return {
    title: chat?.title.toString().slice(0, 50) || "Search",
  };
}

export default async function SharePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const chat = await getSharedChat(id);

  if (!chat || !chat.sharePath) {
    return notFound();
  }

  const models = await getModels();
  return (
    <Chat
      id={chat.id}
      savedMessages={convertToUIMessages(chat.messages)}
      models={models}
    />
  );
}
