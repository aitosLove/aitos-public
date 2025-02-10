"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getNewestMarketState,
  getInsights,
  getEvents,
  getTasks,
} from "./action";
import {
  Brain,
  TrendingUp,
  Bot,
  ArrowUpDown,
  Activity,
  ListTodo,
  CheckCircle,
  XCircle,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";

// 类型定义
type TimeFrame = "1h" | "1d" | "3d" | "7d" | "30d";

interface PriceData {
  value: number;
  change: number;
}

interface RatioData {
  pair: string;
  [key: string]: PriceData | string;
  "1h": PriceData;
  "1d": PriceData;
  "3d": PriceData;
  "7d": PriceData;
  "30d": PriceData;
}

interface Thought {
  id: string;
  topic: string;
  content: string;
  timestamp: string;
}

interface MarketSentiment {
  timeframe: TimeFrame;
  value: number;
  change: number;
}

// 市场认知组件
const MarketPerception = () => {
  const [ratios, setRatios] = useState<RatioData[]>([]);

  const timeframes: TimeFrame[] = ["1h", "1d", "3d", "7d", "30d"];

  useEffect(() => {
    const refresh = () =>
      getNewestMarketState().then((data) => {
        if (data) {
          setRatios(data);
        }
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <div
        className={`flex items-center ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
        <span className="ml-1">{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Market Perception
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2 text-left font-medium">Pair</th>
                    {timeframes.map((tf: TimeFrame) => (
                      <th key={tf} className="p-2 text-left font-medium">
                        {tf}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ratios.map((ratio: RatioData, idx: number) => (
                    <tr
                      key={ratio.pair}
                      className={idx !== ratios.length - 1 ? "border-b" : ""}
                    >
                      <td className="p-2 font-medium">{ratio.pair}</td>
                      {timeframes.map((tf: TimeFrame) => (
                        <td key={tf} className="p-2">
                          <div className="flex items-center justify-between">
                            <span>
                              {(ratio[tf] as PriceData).value.toFixed(4)}
                            </span>
                            {renderChange((ratio[tf] as PriceData).change)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* 
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5" />
                BTC Market Sentiment
              </h3>
              <div className="mt-4 grid grid-cols-5 gap-4">
                {timeframes.map((tf: TimeFrame) => (
                  <div
                    key={tf}
                    className="flex flex-col items-center rounded-lg bg-white p-3 shadow-sm"
                  >
                    <span className="text-sm text-gray-600">{tf}</span>
                    <div className="mt-1 flex items-center text-green-600">
                      <ArrowUpIcon className="h-4 w-4" />
                      <span className="text-lg font-medium">2.3%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </CardContent>
    </Card>
  );
};

// 思考展示组件
const ThoughtStream: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    const refresh = () =>
      getInsights().then((data) => {
        if (data) {
          setThoughts(
            data.map((item) => {
              return {
                id: item.id,
                topic: "Market Insight",
                content: item.insight,
                timestamp: item.timestamp.toISOString(),
              };
            })
          );
        }
      });

    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full h-full bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-100">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6" />
            Thought Stream
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {thoughts.map((thought: Thought) => (
            <div
              key={thought.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-cyan-400">{thought.topic}</h3>
                <span className="text-sm text-gray-400">
                  {formatTimestamp(thought.timestamp)}
                </span>
              </div>
              <p className="mt-2 text-gray-300">{thought.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Agent Avatar
const AgentProfile: React.FC = () => {
  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Agent Profile
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 rounded-xl overflow-hidden">
            <img
              src="/hiro.png"
              alt="Agent Avatar"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Hiro the hAIpe</h2>
            <p className="text-gray-500">
              built on Virtuals Protocol & Hyperliquid
            </p>
          </div>
          {/* <div className="w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Status</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Uptime</span>
              <span className="text-gray-800">24d 13h 45m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Update</span>
              <span className="text-gray-800">2m ago</span>
            </div>
          </div> */}
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
  status: "success" | "failed";
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
    }, 5000);

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
            Events Pool
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
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
                status: "success",
              };
            })
          );
        }
      });
    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 5000);

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
            Active Tasks
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <h3 className="font-medium text-gray-900">{task.name}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(task.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-bold">Agent Status Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 左侧栏 - Agent信息和状态 */}
          <div className="lg:col-span-4 space-y-6">
            <AgentProfile />
            <EventsCard />
            <TasksCard />
          </div>

          {/* 右侧栏 - 市场数据和思考流 */}
          <div className="lg:col-span-8 space-y-6 flex flex-col flex-1">
            <MarketPerception />
            <ThoughtStream />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AgentDashboard;
