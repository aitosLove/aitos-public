"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getEvents } from "@/lib/action";
import { Activity } from "lucide-react";

// Event类型定义
interface Event {
  id: string;
  name: string;
  timestamp: string;
  description: string;
}

// Events卡片组件
export function EventsCard() {
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
}
