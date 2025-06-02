// pages/dashboard.tsx
"use client";

import { useState } from "react";
import EventPumpSection from "@/components/minicard-aptos/EventPump";
import EventPoolSection from "@/components/minicard-aptos/EventPool";
import TaskPool from "@/components/minicard-aptos/TaskPool";
import AgentProfile from "@/components/minicard-aptos/AgentProfile";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Agent Profile Card */}
        <AgentProfile />

        <div className="w-full">
          {/* Event Pump Section */}
          <EventPumpSection />

          {/* Task and Event Pools */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <EventPoolSection />
            <TaskPool />
          </div>
        </div>
      </div>
    </div>
  );
}
