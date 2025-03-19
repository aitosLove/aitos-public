import { PositionCard } from "@/components/mini-card/wallet-preview";
import { PositionHistoryCard } from "@/components/mini-card/portfolio-adjust";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-primary-foreground p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Bottom Section - Market Data and Position Info */}
        <div className="flex flex-col gap-6">
          {/* Right Column - Position Information */}
          <div className="space-y-6">
            <PositionCard />
            <PositionHistoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
