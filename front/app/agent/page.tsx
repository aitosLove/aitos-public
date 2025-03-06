"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  getNewestMarketState,
  getInsights,
  getEvents,
  getTasks,
  getActions,
  getNewestHolding,
} from "@/lib/action";
import {
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Bot,
  ArrowUpDown,
  Activity,
  ListTodo,
  Check,
  Copy,
  History,
  Wallet,
  CheckCircle,
  XCircle,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";

const REFRESH_INTERVAL = 60 * 1000;

// 类型定义
type TimeFrame = "1h" | "1d" | "3d" | "7d" | "30d";

interface PriceData {
  value: number;
  change: number;
}

interface Thought {
  id: string;
  topic: string;
  content: string;
  timestamp: string;
}

// Agent Avatar

const AgentProfile: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const address =
    "0xb187b074ba8fe02ef8ba86a42ccb09f824e29e3decdee3f5793be9feedc431ef";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Watermelon works...
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-48 h-48 mt-12 rounded-xl overflow-hidden">
            <img
              src="/suikai.png"
              alt="Agent Suikai"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">Suikai</h2>
            <p className="text-muted-foreground">All in Suikai, All in Sui&AI</p>
          </div>
          <TooltipProvider>
            <ShadcnTooltip>
              <TooltipTrigger>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={handleCopy}
                >
                  <span className="text-sm font-medium text-gray-600">
                    {shortenAddress(address)}
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Click to copy address"}</p>
              </TooltipContent>
            </ShadcnTooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

// Event类型定义
interface Event {
  id: string;
  name: string;
  timestamp: string;
  description: string;
}

// Task类型定义
interface Task {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  status: "completed" | "failed" | "running" | "pending";
}

// Events卡片组件
const EventsCard = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const refresh = () =>
      getEvents().then((data) => {
        if (data) {
          setEvents(
            data.map((item) => {
              return {
                id: item.id,
                name: item.type,
                timestamp: item.timestamp?.toISOString(),
                description: item.description,
              };
            })
          );
        }
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Events Pool by SekaiOS
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto space-y-3 pr-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border bg-background p-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-blue-600">{event.name}</h3>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{event.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Tasks卡片组件
const TasksCard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const refresh = () =>
      getTasks().then((data) => {
        if (data) {
          setTasks(
            data.map((item) => {
              return {
                id: item.id,
                name: item.type,
                timestamp: item.timestamp.toISOString(),
                description: item.description,
                status: item.status,
              };
            })
          );
        }
      });
    refresh();

    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Active Tasks by SekaiOS
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto space-y-3 pr-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border bg-background p-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <h3 className="font-medium text-primary">{task.name}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(task.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 更新主页面布局
const AgentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Row - Profile, Events, Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AgentProfile />
          <EventsCard />
          <TasksCard />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
