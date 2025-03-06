import { MarketPerception } from "@/components/mini-card/ratio-chart";
import { ThoughtStream } from "@/components/mini-card/insight-thinking";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Bottom Section - Market Data and Position Info */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left Column - Market Analysis */}
          <div className="space-y-6">
            <MarketPerception />
            <ThoughtStream />
          </div>
        </div>
      </div>
    </div>
  );
}
