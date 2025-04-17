"use client";
import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  Zap,
  MoreHorizontal,
  LayoutList,
  LayoutGrid,
  Search,
  Filter,
  Terminal,
  Trash2,
  Pause,
  Play,
  RotateCw,
  ListFilter,
  ChevronDown,
} from "lucide-react";
import { getTasks } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import { motion, AnimatePresence } from "framer-motion";

type TaskStatus = "success" | "processing" | "failed" | "pending";
type TaskPriority = "high" | "medium" | "low";
type TaskCategory = "analysis" | "transaction" | "monitoring" | "maintenance";

type Task = {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  executionTime: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  progress?: number;
};

export default function TaskPool() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "grouped">("timeline");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [filterCategory, setFilterCategory] = useState<TaskCategory | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const STAGGER_DELAY = 60;

  // Enhanced data with categories and priorities
  const enhanceTaskData = (data: any[]): Task[] => {
    const categories: TaskCategory[] = [
      "analysis",
      "transaction",
      "monitoring",
      "maintenance",
    ];
    const priorities: TaskPriority[] = ["high", "medium", "low"];

    return data.map((item) => ({
      id: item.id,
      name: item.type,
      description: enhanceDescription(item.type, item.description),
      status: mapTaskStatus(item.status),
      executionTime: item.timestamp?.toISOString() || new Date().toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      progress:
        item.status === "running"
          ? Math.floor(Math.random() * 100)
          : item.status === "completed"
          ? 100
          : item.status === "failed"
          ? Math.floor(Math.random() * 60)
          : 0,
    }));
  };

  const enhanceDescription = (type: string, description: string): string => {
    // Improve task descriptions
    const enhancedDescriptions: Record<string, string> = {
      UPDATE_HOLDING_EVENT:
        "Synchronizing portfolio assets across multiple blockchain networks",
      UPDATE_PORTFOLIO_EVENT:
        "Rebalancing asset allocations based on AI-driven market analysis",
      UPDATE_INSIGHT_EVENT:
        "Generating predictive analytics for emerging market opportunities",
      UPDATE_RATE_EVENT:
        "Real-time aggregation of cross-exchange rate differentials",
      TELEGRAM_REQUEST:
        "Processing secure user command through encrypted messaging channel",
    };

    return (
      enhancedDescriptions[type] ||
      description ||
      "Executing automated blockchain operation"
    );
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      if (data) {
        setTasks(enhanceTaskData(data));
      }

      // Trigger entrance animation
      setTimeout(() => setAnimateIn(true), 100);
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
      pending: "pending",
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

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesCategory = !filterCategory || task.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
      case "processing":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500";
      case "failed":
        return "border-rose-500/30 bg-rose-500/10 text-rose-500";
      default:
        return "border-blue-500/30 bg-blue-500/10 text-blue-500";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "success":
        return <CheckCircle2 className={`text-emerald-500 ${iconClass}`} />;
      case "processing":
        return (
          <Loader2 className={`text-amber-500 animate-spin ${iconClass}`} />
        );
      case "failed":
        return <AlertCircle className={`text-rose-500 ${iconClass}`} />;
      default:
        return <Clock className={`text-blue-500 ${iconClass}`} />;
    }
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500";
      case "medium":
        return "border-blue-500/30 bg-blue-500/10 text-blue-500";
      case "low":
        return "border-slate-500/30 bg-slate-500/10 text-slate-500";
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-500";
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case "analysis":
        return <Terminal className="h-4 w-4 mr-1" />;
      case "transaction":
        return <RotateCw className="h-4 w-4 mr-1" />;
      case "monitoring":
        return <Zap className="h-4 w-4 mr-1" />;
      case "maintenance":
        return <Trash2 className="h-4 w-4 mr-1" />;
      default:
        return <Terminal className="h-4 w-4 mr-1" />;
    }
  };

  const getCategoryStyle = (category: TaskCategory) => {
    switch (category) {
      case "analysis":
        return "border-violet-500/30 bg-violet-500/10 text-violet-500";
      case "transaction":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
      case "monitoring":
        return "border-blue-500/30 bg-blue-500/10 text-blue-500";
      case "maintenance":
        return "border-orange-500/30 bg-orange-500/10 text-orange-500";
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-500";
    }
  };

  const getTaskActionButton = (task: Task) => {
    switch (task.status) {
      case "processing":
        return (
          <motion.button
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-amber-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Pause Task"
          >
            <Pause className="h-4 w-4" />
          </motion.button>
        );
      case "pending":
        return (
          <motion.button
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-blue-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Start Task"
          >
            <Play className="h-4 w-4" />
          </motion.button>
        );
      case "failed":
        return (
          <motion.button
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-rose-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Retry Task"
          >
            <RotateCw className="h-4 w-4" />
          </motion.button>
        );
      default:
        return null;
    }
  };

  const countTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status).length;
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden flex flex-col h-full max-h-[48rem] relative">
      {/* Decorative background elements */}
      {/* <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-20 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" /> */}

      {/* Header Section */}
      <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Task Execution Pool</h1>
            <p className="text-sm text-muted-foreground">
              Distributed blockchain operations manager
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-3">
          <motion.div 
            className="relative flex items-center rounded-lg border border-border/30 bg-card/60 px-3 py-1.5 text-sm focus-within:ring-1 focus-within:ring-primary"
            initial={{ width: "40px", opacity: 0.8 }}
            whileFocus={{ width: "200px", opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="ml-2 bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          
          <div className="flex bg-card/60 rounded-lg border border-border/30 p-1">
            <motion.button
              className={`p-1.5 rounded-md ${viewMode === 'timeline' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('timeline')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LayoutList className="h-4 w-4" />
            </motion.button>
            <motion.button
              className={`p-1.5 rounded-md ${viewMode === 'grouped' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('grouped')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LayoutGrid className="h-4 w-4" />
            </motion.button>
          </div>
          
          <motion.button 
            className="p-2 rounded-lg hover:bg-card/80 transition-colors border border-border/30"
            onClick={handleManualRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </motion.button>
        </div> */}
      </div>

      {/* Filter Chips */}
      {/* <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-border/30 relative z-10">
        <div className="flex items-center gap-1.5 mr-2">
          <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Status:</span>
        </div>
        
        {["success", "processing", "failed", "pending"].map((status) => (
          <motion.button
            key={status}
            className={`
              text-xs px-2.5 py-1 rounded-full border flex items-center
              ${filterStatus === status ? getStatusStyle(status as TaskStatus) : 'border-border/30 bg-card/60 text-muted-foreground'}
            `}
            onClick={() => setFilterStatus(filterStatus === status as TaskStatus ? null : status as TaskStatus)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterStatus === status && getStatusIcon(status as TaskStatus)}
            <span className="capitalize">{status}</span>
            {countTasksByStatus(status as TaskStatus) > 0 && (
              <span className="ml-1.5 bg-background/80 text-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                {countTasksByStatus(status as TaskStatus)}
              </span>
            )}
          </motion.button>
        ))}
        
        {(filterStatus || filterCategory || searchQuery) && (
          <motion.button
            className="text-xs px-2.5 py-1 rounded-full border border-border/30 bg-card/60 text-primary hover:bg-primary/10"
            onClick={() => {
              setFilterStatus(null);
              setFilterCategory(null);
              setSearchQuery("");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        )}
      </div> */}

      {/* Task Display Area */}
      <div className="flex-grow overflow-y-auto p-5 relative z-10">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-muted-foreground p-8"
            >
              <div className="bg-primary/5 p-4 rounded-full mb-4">
                <Terminal className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-center mb-2">No tasks found</p>
              <p className="text-sm text-center text-muted-foreground/70">
                Try adjusting your filters or wait for new tasks
              </p>
            </motion.div>
          ) : viewMode === "timeline" ? (
            <div className="relative space-y-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: animateIn ? 1 : 0,
                    y: animateIn ? 0 : 20,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden hover:shadow transition-all"
                >
                  {/* Progress bar at the top */}
                  {task.status === "processing" && (
                    <div className="h-1 bg-amber-500/20 w-full">
                      <motion.div
                        className="h-1 bg-amber-500"
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                  {task.status === "success" && (
                    <div className="h-1 bg-emerald-500" />
                  )}
                  {task.status === "failed" && (
                    <div className="h-1 bg-rose-500" />
                  )}
                  {task.status === "pending" && (
                    <div className="h-1 bg-blue-500" />
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">
                              {task.name}
                            </h3>
                            {/* {task.priority && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                              </span>
                            )} */}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch flex-wrap gap-1">
                        {" "}
                        <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-background/50 rounded-full">
                          {formatTimestamp(task.executionTime)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status}</span>
                        </span>
                        {/* {task.category && (
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getCategoryStyle(task.category)}`}>
                                {getCategoryIcon(task.category)}
                                <span className="capitalize">{task.category}</span>
                              </span>
                            )} */}
                      </div>
                      {/* <div className="flex items-center gap-1">
                        {getTaskActionButton(task)}
                        <motion.button
                          className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </motion.button>
                      </div> */}
                    </div>

                    {/* Progress indicator for processing tasks */}
                    {/* {task.status === "processing" && task.progress !== undefined && (
                      <div className="mt-3 px-11">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1.5">
                          <motion.div 
                            className="h-1.5 rounded-full bg-amber-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )} */}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: animateIn ? 1 : 0,
                    y: animateIn ? 0 : 20,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden hover:shadow transition-all"
                >
                  {task.status === "processing" && (
                    <div className="h-1 bg-amber-500/20 w-full">
                      <motion.div
                        className="h-1 bg-amber-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${task.progress || 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                  {task.status === "success" && (
                    <div className="h-1 bg-emerald-500" />
                  )}
                  {task.status === "failed" && (
                    <div className="h-1 bg-rose-500" />
                  )}
                  {task.status === "pending" && (
                    <div className="h-1 bg-blue-500" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-foreground">
                              {task.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {task.priority && (
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityStyle(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                              {task.category && (
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryStyle(
                                    task.category
                                  )}`}
                                >
                                  {task.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {getTaskActionButton(task)}
                            <motion.button
                              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {task.description}
                        </p>

                        {/* Progress indicator for processing tasks */}
                        {task.status === "processing" &&
                          task.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  Progress
                                </span>
                                <span className="font-medium">
                                  {task.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-muted/30 rounded-full h-1.5">
                                <motion.div
                                  className="h-1.5 rounded-full bg-amber-500"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          )}

                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getStatusStyle(
                              task.status
                            )}`}
                          >
                            {getStatusIcon(task.status)}
                            <span className="capitalize">{task.status}</span>
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTimestamp(task.executionTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
