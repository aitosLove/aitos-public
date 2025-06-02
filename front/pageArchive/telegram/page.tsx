import { TelegramMessageCard } from "@/components/mini-card/telegram-message";
import { TGEventsCard } from "@/components/mini-card/telegram-event-pool";
import { TGTasksCard } from "@/components/mini-card/telegram-task-pool";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Settings, User } from "lucide-react";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-primary-foreground">
      {/* Header */}
      

      {/* Main Content */}
      <main className="pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-6">
        

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Events & Tasks Column */}
            <div className="lg:col-span-5 space-y-6">
              <TGEventsCard />
              <TGTasksCard />
            </div>

            {/* Messages Column */}
            <div className="lg:col-span-7 space-y-6">
              

              <TelegramMessageCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 SekaiOS. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
