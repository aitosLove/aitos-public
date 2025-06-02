import { Chat } from "@/app/chat/(chat)/components/chat";
import { getModels } from "@/app/chat/(chat)/lib/config/models";
import { generateId } from "ai";
import { redirect } from "next/navigation";

export const maxDuration = 60;

export default async function SearchPage(props: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await props.searchParams;
  if (!q) {
    redirect("/");
  }

  const id = generateId();
  const models = await getModels();
  return <Chat id={id} query={q} models={models} />;
}
