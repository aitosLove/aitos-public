"use client";
import { ListTodo } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function EventPumpSection() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "standby":
        return "bg-gray-100 text-gray-600";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-background rounded-lg p-6 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {/* <ListTodo className="text-sky-500" size={18} /> */}
          Event Pump
        </h2>
        {/* <div className="flex gap-2">
          <button className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50">
            Filter
          </button>
        </div> */}
      </div>

      <div className="space-y-2 max-h-[28rem] overflow-y-auto">
        {eventPumps.map((pump) => (
          <div
            key={pump.id}
            className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-800 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-primary">{pump.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{pump.description}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  pump.status
                )}`}
              >
                {pump.status}
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Last triggered: {pump.lastTriggered}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
