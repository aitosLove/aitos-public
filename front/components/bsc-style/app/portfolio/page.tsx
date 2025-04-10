import { PositionCard } from "@/components/minicard-bsc/wallet-preview";
import { PositionHistoryCard } from "@/components/minicard-bsc/portfolio-adjust";

import { TradingInstructPanel } from "@/components/minicard-bsc/instruct-panel";
export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-8xl space-y-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <PositionCard />
              </div>
              <div className="col-span-1 md:col-span-1">
                <TradingInstructPanel />
              </div>
            </div>
            <PositionHistoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
