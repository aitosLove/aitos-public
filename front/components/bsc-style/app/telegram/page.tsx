import { TelegramMessageCard } from "@/components/minicard-bsc/telegram-message";
import { SystemEventStream } from "@/components/minicard-bsc/EventPool";
import TaskPool from "@/components/minicard-bsc/TaskPool";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 pb-12">
        <div className="mx-auto max-w-8xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <SystemEventStream />
              <TaskPool />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <TelegramMessageCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
