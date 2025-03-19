import { AgentProfile } from "@/components/mini-card/agent-profile";
import { EventsCard } from "@/components/mini-card/event-pool";
import { TasksCard } from "@/components/mini-card/task-pool";
import { EventPumpsCard } from "@/components/mini-card/event-pump";
import { AIPortfolioSummary } from "@/components/mini-card/ai-portfolio-summary";
import { SuiAnalysisMiniCard } from "@/components/mini-card/sui-analysis-summary";

// 更新主页面布局
export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Row - Profile, Events, Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AgentProfile />
          <EventsCard />
          <TasksCard />
          <EventPumpsCard />
          <SuiAnalysisMiniCard />
          <AIPortfolioSummary />
        </div>
      </div>
    </div>
  );
}
