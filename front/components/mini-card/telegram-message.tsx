"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getTgMessageRecord } from "@/lib/action";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TelegramMessage {
  id: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt: Date | null;
}

export function TelegramMessageCard() {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getTgMessageRecord();
        setMessages(data?.map(item => ({
          id: item.id,
          content: item.content.toString(),
          status: item.status,
          sentAt: item.sentAt
        })) || []);
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'sent':
        return <span className={`${baseStyle} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200`}>Sent</span>;
      case 'failed':
        return <span className={`${baseStyle} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200`}>Failed</span>;
      case 'pending':
        return <span className={`${baseStyle} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200`}>Pending</span>;
      default:
        return <span className={`${baseStyle} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}>Unknown</span>;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Scheduling...';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full border-0 shadow-sm hover:shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium text-primary">
          {/* <History className="h-5 w-5 text-blue-600" /> */}
          {/* <Skeleton className="h-6 w-[200px]" /> */}
          Telegram Message History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  {/* 状态标签 + 内容 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  {/* 时间戳 */}
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) :  (
          messages.map((message) => (
            <div 
              key={message.id}
              className="group border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              // onClick={() => setExpandedId(expandedId === message.id ? null : message.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusBadge(message.status)}
                  <span className="text-sm font-medium truncate flex-1">
                    {message.content}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 whitespace-nowrap">
                    {formatTime(message.sentAt)}
                  </span>
                  {/* {expandedId === message.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )} */}
                </div>
              </div>
              
              {/* {expandedId === message.id && (
                <div className="mt-3 pt-3 border-t border-dashed">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Message ID:</span>
                    <span className="font-mono">{message.id}</span>
                  </div>
                </div>
              )} */}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
