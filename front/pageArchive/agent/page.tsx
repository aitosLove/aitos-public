import AgentSummaryCard from '@/components/mini-agent-card/AgentSummaryCard';
import EventPumpSection from '@/components/mini-agent-card/EventPump';
import EventPoolSection from '@/components/mini-agent-card/EventPool';
import TaskPool from '@/components/mini-agent-card/TaskPool';
import { MarketAnalysisCard } from '@/components/mini-agent-card/MarketAnalysis';
import PortfolioCard from '@/components/mini-agent-card/Portfolio';
import { SuiAnalysisMiniCard } from '@/components/mini-agent-card/MarketAnalysisMini';

export default function Dashboard() {
  return (
    <div className="bg-primary-foreground min-h-screen p-6">
      <div className="max-w-8xl mx-auto">
        <header className="mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-800 mb-4">Agent Dashboard</h1> */}
          <AgentSummaryCard />
        </header>
        
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="col-span-4 md:col-span-1 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <EventPumpSection />
          </div>
          
          <div className="col-span-4 md:col-span-1 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <EventPoolSection />
          </div>
          
          <div className="col-span-4 md:col-span-1 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <TaskPool />
          </div>

          {/* Row 2 */}
          <div className="col-span-4 md:col-span-2 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <SuiAnalysisMiniCard />
          </div>
          
          <div className="col-span-4 md:col-span-1 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <PortfolioCard />
          </div>
        </div>
      </div>
    </div>
  );
}
