"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getActions } from "@/lib/action";
import { History } from "lucide-react";

interface PositionHistory {
  timestamp: string;
  action: string;
  reason: string;
}

// 仓位历史记录组件
export function PositionHistoryCard() {
  const [history, setHistory] = useState<PositionHistory[]>([]);

  useEffect(() => {
    const refresh = () =>
      getActions().then((data) => {
        if (data) {
          setHistory(
            data.map((item) => {
              return {
                timestamp: item.timestamp.toISOString(),
                action: item.action,
                reason: item.reason,
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
    <Card className="w-full border-0 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            {/* <History className="h-6 w-6" /> */}
            Position Adjustments (Driven by Navi)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-full overflow-y-auto p-2">
          {history.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border bg-background p-4 hover:border-sky-300 hover:shadow-sm hover:shadow-sky-300/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-blue-600">{item.action}</h3>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 hover:line-clamp-none transition-all">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
