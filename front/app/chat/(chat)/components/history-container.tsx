import React from "react";
import { History } from "./history";
import { HistoryList } from "./history-list";

export default async function HistoryContainer() {
  const enableSaveChatHistory = process.env.ENABLE_SAVE_CHAT_HISTORY === "true";
  if (!enableSaveChatHistory) {
    return <></>;
  }

  return (
    <History>
      <HistoryList userId="anonymous" />
    </History>
  );
}
