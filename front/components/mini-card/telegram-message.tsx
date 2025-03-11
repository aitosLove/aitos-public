"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getActions, getTgMessageRecord } from "@/lib/action";
import { History } from "lucide-react";

interface TelegramMessage {
  id: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt: Date | null;
}

// 仓位历史记录组件
export function TelegramMessageCard() {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getTgMessageRecord();
        console.log(data)
        if (data) {
          setMessages(data.map(item => ({
            id: item.id,
            content: item.content.toString(),
            status: item.status,
            sentAt: item.sentAt
          })));
        }
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };




    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6" />
            Messages History
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-full overflow-y-auto pr-2">
          {messages.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border bg-background-4 hover:bg-background transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-600">{item.content}</h3>
                <span className="text-sm text-gray-500">
                  {item.sentAt ? formatTimestamp(item.sentAt.toISOString()) : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 hover:line-clamp-none transition-all">
                {item.id}
              </p>

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
