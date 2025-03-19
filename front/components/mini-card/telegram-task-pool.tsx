"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getTasks } from "@/lib/action";
import { 
  ListTodo, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Task类型定义
interface Task {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  status: "completed" | "failed" | "running" | "pending";
}

// Tasks卡片组件
export function TGTasksCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    try {
      setRefreshing(true);
      const data = await getTasks();
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
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" 
            className="bg-green-50 text-green-700 border-green-200
                     dark:bg-green-900/30 dark:text-green-200 dark:border-green-700">
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline"
            className="bg-red-50 text-red-700 border-red-200
                     dark:bg-red-900/30 dark:text-red-200 dark:border-red-700">
            Failed
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200
                     dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700">
            Running
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200
                     dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200
                     dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            Unknown
          </Badge>
        );
    }
  };
  

  return (
    <Card className="w-full border-0 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
        <CardTitle className="text-lg font-medium text-primary">
          <div className="flex items-center gap-2">
            {/* <ListTodo className="h-5 w-5 text-purple-600" /> */}
            Active Tasks by SekaiOS
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
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
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks found</p>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-muted bg-background p-3 hover:bg-muted transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-medium text-primary">{task.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatTimestamp(task.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}