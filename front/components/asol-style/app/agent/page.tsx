// pages/dashboard.tsx

import { useState } from "react";
import { WorkflowAutomations } from "@/components/minicard-bsc/EventPump";
import { SystemEventStream } from "@/components/minicard-bsc/EventPool";
import TaskPool from "@/components/minicard-bsc/TaskPool";
import AgentProfile from "@/components/minicard-bsc/AgentProfile";

export default function Dashboard() {

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Agent Profile Card */}
        <AgentProfile />

        <div className="w-full">
          {/* Event Pump Section */}
          <WorkflowAutomations />
          {/* Task and Event Pools */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <SystemEventStream />
            <TaskPool />
          </div>
        </div>
      </div>
    </div>
  );
}
