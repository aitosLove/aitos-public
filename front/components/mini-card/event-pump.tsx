"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Webhook, Eye, Activity } from "lucide-react";

// 定义事件泵的数据类型
interface EventPump {
  id: string;
  name: string;
  type: "timer" | "hook" | "listener";
  status: "active" | "standby" | "error";
  lastTriggered: string; // 最近一次触发时间
  description: string; // 事件泵的介绍
}

// 定时刷新间隔（单位：毫秒）
const REFRESH_INTERVAL = 60 * 1000;

// 模拟获取事件泵数据的函数（需替换为实际 API 调用）
const getEventPumps = async (): Promise<EventPump[]> => {
  return [
    {
      id: "1",
      name: "Market Insight Update",
      type: "timer",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Updates market insights every 5 minutes to provide the latest analysis and trends.",
    },
    {
      id: "2",
      name: "Portfolio Data Update",
      type: "timer",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Refreshes portfolio data every 10 minutes to keep track of the latest asset values and performance.",
    },
    {
      id: "3",
      name: "Adjust Portfolio",
      type: "hook",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Automatically adjusts the portfolio whenever new market insights are available, ensuring optimal asset allocation.",
    },
  ];
};

export const EventPumpsCard: React.FC = () => {
  const [eventPumps, setEventPumps] = useState<EventPump[]>([]);

  // 定时刷新数据
  useEffect(() => {
    const refresh = async () => {
      const data = await getEventPumps();
      setEventPumps(data);
    };

    refresh(); // 组件加载时首次获取数据
    const interval = setInterval(refresh, REFRESH_INTERVAL); // 每隔一段时间刷新

    return () => clearInterval(interval); // 组件卸载时清理定时器
  }, []);

  // 根据状态返回颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "standby":
        return "text-gray-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // 根据类型返回图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "timer":
        return <Clock className="h-4 w-4" />;
      case "hook":
        return <Webhook className="h-4 w-4" />;
      case "listener":
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Event Pumps
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventPumps.map((pump) => (
            <div
              key={pump.id}
              className="rounded-lg border bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(pump.type)}
                  <h3 className="font-medium">{pump.name}</h3>
                </div>
                <span className={`text-sm ${getStatusColor(pump.status)}`}>
                  {pump.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Last Triggered: {pump.lastTriggered}</p>
                <p className="mt-1">- {pump.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventPumpsCard;
