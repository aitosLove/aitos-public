import React from "react";
import { History } from "./history";
import { HistoryList } from "./history-list";

const HistoryContainer: React.FC = async () => {
  const enableSaveChatHistory = process.env.ENABLE_SAVE_CHAT_HISTORY === "true";
  if (!enableSaveChatHistory) {
    return null;
  }

  return (
    <History>
      <HistoryList userId="anonymous" />
    </History>
  );
};

export default HistoryContainer;
