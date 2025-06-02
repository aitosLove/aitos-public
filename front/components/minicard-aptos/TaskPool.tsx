// components/TaskPool.tsx
"use client";
import { Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getTasks } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

type TaskStatus = "success" | "processing" | "failed" | "pending";

type Task = {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  executionTime: string;
};

export default function TaskPool() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = async () => {
    const data = await getTasks();
    if (data) {
      setTasks(
        data.map((item) => ({
          id: item.id,
          name: item.type,
          description: item.description,
          status: mapTaskStatus(item.status),
          executionTime: item.timestamp?.toISOString(),
        }))
      );
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTasks();
    
    // Set up interval for periodic refresh
    const interval = setInterval(fetchTasks, REFRESH_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    // Add a slight delay to show the refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const mapTaskStatus = (status: string): TaskStatus => {
    const statusMap: Record<string, TaskStatus> = {
      completed: "success",
      running: "processing",
      failed: "failed",
      pending: "pending",
    };
    return statusMap[status.toLowerCase()] || "pending";
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      case "processing":
        return <Loader2 className={`${iconClass} animate-spin text-amber-500`} />;
      case "failed":
        return <AlertCircle className={`${iconClass} text-rose-500`} />;
      default:
        return <Clock className={`${iconClass} text-slate-400`} />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
      case "failed":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const getStatusDotColor = (status: TaskStatus) => {
    switch (status) {
      case "success":
        return "text-emerald-500";
      case "processing":
        return "text-amber-500";
      case "failed":
        return "text-rose-500";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border h-full shadow-sm overflow-hidden flex flex-col max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Task Pool</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time tracking of system tasks</p>
        </div>
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          onClick={handleManualRefresh}
          aria-label="Refresh tasks"
          title="Refresh tasks"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-5 w-5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No tasks currently in queue</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tasks will appear here when scheduled</p>
          </div>
        ) : (
          <Timeline className="space-y-4">
            {tasks.map((task, index) => (
              <TimelineItem key={task.id} className="group">
                <TimelineSeparator>
                  <TimelineDot className={`size-3 ${getStatusDotColor(task.status)}`} />
                  {index < tasks.length - 1 && (
                    <TimelineConnector className="h-14 mt-1" />
                  )}
                </TimelineSeparator>
                <TimelineContent className="mt-0 mb-0 py-1">
                  <div className="bg-card/50 group-hover:bg-muted/50 p-3 rounded-lg border border-transparent group-hover:border-border transition-all duration-200">
                    <TimelineTitle>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm text-primary flex items-center gap-2">
                          {task.name}
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          {formatTimestamp(task.executionTime)}
                        </span>
                      </div>
                    </TimelineTitle>
                    <TimelineDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {task.description}
                      </p>
                    </TimelineDescription>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </div>
    </div>
  );
}