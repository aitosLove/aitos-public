import { TelegramMessageCard } from "@/components/mini-card/telegram-message";
import { TGEventsCard } from "@/components/mini-card/telegram-event-pool";
import { TGTasksCard } from "@/components/mini-card/telegram-task-pool";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Settings, User } from "lucide-react";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 flex h-full mt-4 items-center justify-between">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Agent Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor your automated tasks, messages, and events in real-time
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumbs */}
          {/* <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/agent" isCurrentPage>Agent Monitor</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </div> */}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Events & Tasks Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="h-44 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  System Status
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4">
                      <div className="text-green-600 font-medium">
                        Active Tasks
                      </div>
                      <div className="text-2xl font-semibold mt-1">24</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4">
                      <div className="text-blue-600 font-medium">Messages</div>
                      <div className="text-2xl font-semibold mt-1">156</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <TGEventsCard />
              <TGTasksCard />
            </div>

            {/* Messages Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="h-44 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                <h2 className="text-xl font-medium mb-2">
                  Welcome to Agent Monitor
                </h2>
                <p className="opacity-90">
                  Your automated tasks are running smoothly. System health is
                  optimal.
                </p>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium text-sm hover:bg-opacity-90 transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              <TelegramMessageCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
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
      </footer>
    </div>
  );
}
