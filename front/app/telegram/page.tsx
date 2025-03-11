import { MarketPerception } from "@/components/mini-card/ratio-chart";
import { ThoughtStream } from "@/components/mini-card/insight-thinking";
import { PositionCard } from "@/components/mini-card/wallet-preview";
import { PositionHistoryCard } from "@/components/mini-card/portfolio-adjust";
import { TasksCard } from "@/components/mini-card/task-pool";
import { TelegramMessageCard } from "@/components/mini-card/telegram-message";

export default function AgentDashboard() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <TelegramMessageCard />
                    <ThoughtStream />
                    <PositionHistoryCard />
                    <TasksCard />
                </div>
            </div>
        </div>
    );
}
