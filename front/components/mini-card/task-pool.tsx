"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getTasks } from "@/lib/action";
import { ListTodo, CheckCircle, XCircle } from "lucide-react";

// Task类型定义
interface Task {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  status: "completed" | "failed" | "running" | "pending";
}

// Tasks卡片组件
export function TasksCard() {
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
              <p className="mt-1 text-sm text-muted-foreground">
                {task.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
