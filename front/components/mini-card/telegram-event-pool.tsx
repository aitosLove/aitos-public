"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getEvents } from "@/lib/action";
import { Activity, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Event类型定义
interface Event {
  id: string;
  name: string;
  timestamp: string;
  description: string;
}

// Events卡片组件
export function TGEventsCard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    try {
      setRefreshing(true);
      const data = await getEvents();
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
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get event type badge color based on event name
  const getEventBadge = (name: string) => {
    const lowerName = name.toLowerCase();
  
    // 颜色方案设计原则：
    // 1. 暗色背景使用深色调（900系列）保持对比度
    // 2. 文字使用200-300系列保证可读性
    // 3. 边框使用700系列保持可见性
    // 4. 保持与亮色模式相同的语义颜色
  
    if (lowerName.includes('error') || lowerName.includes('fail')) {
      return (
        <Badge variant="outline" 
          className="bg-red-50 text-red-700 border-red-200
                   dark:bg-red-900/30 dark:text-red-200 dark:border-red-700">
          {name}
        </Badge>
      );
    } 
    else if (lowerName.includes('warn')) {
      return (
        <Badge variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200
                   dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700">
          {name}
        </Badge>
      );
    } 
    else if (lowerName.includes('success') || lowerName.includes('complete')) {
      return (
        <Badge variant="outline"
          className="bg-green-50 text-green-700 border-green-200
                   dark:bg-green-900/30 dark:text-green-200 dark:border-green-700">
          {name}
        </Badge>
      );
    } 
    else if (lowerName.includes('info') || lowerName.includes('log')) {
      return (
        <Badge variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200
                   dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700">
          {name}
        </Badge>
      );
    } 
    else {
      return (
        <Badge variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200
                   dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
          {name}
        </Badge>
      );
    }
  };
  

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-primary">
          <div className="flex items-center gap-2">
            {/* <Activity className="h-5 w-5 text-indigo-600" /> */}
            Events Pool by SekaiOS
          </div>
        </CardTitle>
        <button 
          onClick={refresh}
          className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-800/30"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full mt-2" />
                <Skeleton className="h-3 w-2/3 mt-1" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No events found</p>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-muted bg-background p-3 hover:bg-gray-50 dark:hover:bg-muted transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getEventBadge(event.name)}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}