import { DefiInsight } from "@/components/mini-card/defi-insight";
import { PositionCard } from "@/components/mini-card/wallet-preview";
import { DefiInstructPanel } from "@/components/mini-card/instruct-panel";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-primary-foreground p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Bottom Section - Market Data and Position Info */}
        {/* <div className="flex flex-row gap-6">
          <div className="w-1/2">
            <PositionCard />
            <InstructPanel />
          </div>

          <DefiInsight />
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PositionCard />
            <DefiInstructPanel />
          </div>
          <DefiInsight />
        </div>
      </div>
    </div>
  );
}
