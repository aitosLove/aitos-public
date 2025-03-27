import { PositionCard } from "@/components/mini-card/wallet-preview";
import { PositionHistoryCard } from "@/components/mini-card/portfolio-adjust";

import { TradingInstructPanel } from "@/components/mini-card/instruct-panel";
export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-primary-foreground p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PositionCard />
              <TradingInstructPanel />
            </div>
            <PositionHistoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
