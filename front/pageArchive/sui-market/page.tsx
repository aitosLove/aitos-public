import { MarketPerception } from "@/components/mini-card/ratio-chart";
import { ThoughtStream } from "@/components/mini-card/insight-thinking";
import { MarketInstructPanel } from "@/components/mini-card/instruct-panel";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-primary-foreground p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Left Column - Market Analysis */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketPerception />
              <MarketInstructPanel />
            </div>
            <ThoughtStream />
          </div>
        </div>
      </div>
    </div>
  );
}
