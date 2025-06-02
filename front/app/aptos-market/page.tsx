import { MarketPerception } from "@/components/minicard-aptos/ratio-chart";
import { ThoughtStream } from "@/components/minicard-aptos/insight-thinking";
import { MarketInstructPanel } from "@/components/minicard-aptos/instruct-panel";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left Column - Market Analysis */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <MarketPerception />
              </div>
              <div className="col-span-1 md:col-span-1">
                <MarketInstructPanel />
              </div>
            </div>
            <ThoughtStream />
          </div>
        </div>
      </div>
    </div>
  );
}
