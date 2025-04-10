"use client";
import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { getTasks } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";

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
  const [viewMode, setViewMode] = useState<"timeline" | "grouped">("timeline");
  const STAGGER_DELAY = 50;

  const fetchTasks = async () => {
    const data = await getTasks();
    if (data) {
      setTasks(data.map(item => ({
        id: item.id,
        name: item.type,
        description: item.description,
        status: mapTaskStatus(item.status),
        executionTime: item.timestamp?.toISOString()
      })));
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const mapTaskStatus = (status: string): TaskStatus => {
    const statusMap: Record<string, TaskStatus> = {
      completed: "success",
      running: "processing",
      failed: "failed",
      pending: "pending"
    };
    return statusMap[status.toLowerCase()] || "pending";
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "success":
        return "border-emerald-500/30 bg-emerald-50/40 dark:border-emerald-400/20 dark:bg-emerald-950/30";
      case "processing":
        return "border-amber-500/30 bg-amber-50/40 dark:border-amber-400/20 dark:bg-amber-950/30";
      case "failed":
        return "border-rose-500/30 bg-rose-50/40 dark:border-rose-400/20 dark:bg-rose-950/30";
      default:
        return "border-blue-500/30 bg-blue-50/40 dark:border-blue-400/20 dark:bg-blue-950/30";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "success":
        return <CheckCircle2 className={`text-emerald-500 ${iconClass}`} />;
      case "processing":
        return <Loader2 className={`text-amber-500 animate-spin ${iconClass}`} />;
      case "failed":
        return <AlertCircle className={`text-rose-500 ${iconClass}`} />;
      default:
        return <Clock className={`text-blue-500 ${iconClass}`} />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden flex flex-col h-full max-h-[48rem]">
      {/* Header Section */}
      <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-lime-500/10 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-lime-500" />
          </div>
          <div>
            <h1 className="text-lg text-accent font-semibold">Task Pool</h1>
            <p className="text-sm text-muted-foreground">Real-time system task execution</p>
          </div>
        </div>


      </div>

      {/* Task Display Area */}
      <div className="flex-grow overflow-y-auto p-5">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No active tasks
          </div>
        ) : viewMode === "timeline" ? (
          <div className="relative  border-border ml-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={` pb-4 relative ${getStatusStyle(task.status)} border rounded-xl p-4 mb-4 transition-all hover:shadow-md`}
                style={{ transitionDelay: `${index * STAGGER_DELAY}ms` }}
              >
              
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                      {/* <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status}</span>
                        </span>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span> */}
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(task.executionTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border ${getStatusStyle(task.status)} transition-all hover:shadow-md`}
                style={{ transitionDelay: `${index * STAGGER_DELAY}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{task.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
