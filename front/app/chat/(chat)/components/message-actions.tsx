"use client";

import { CHAT_ID } from "@/app/chat/(chat)/lib/constants";
import { cn } from "@/app/chat/(chat)/lib/utils";
import { useChat } from "ai/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ChatShare } from "./chat-share";
import { Button } from "@/components//ui/button";

interface MessageActionsProps {
  message: string;
  chatId?: string;
  enableShare?: boolean;
  className?: string;
}

export function MessageActions({
  message,
  chatId,
  enableShare,
  className,
}: MessageActionsProps) {
  const { isLoading } = useChat({
    id: CHAT_ID,
  });
  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  }

  if (isLoading) {
    return <div className="size-10" />;
  }

  return (
    <div className={cn("flex items-center gap-0.5 self-end", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
      {enableShare && chatId && <ChatShare chatId={chatId} />}
    </div>
  );
}
