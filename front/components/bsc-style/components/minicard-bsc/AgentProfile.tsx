// components/AgentProfile.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Copy,
  ExternalLink,
  Bell,
  Shield,
  Settings,
  ChevronDown,
  Cpu,
  Activity,
  Clock,
  ChevronRight,
  Zap,
  Server,
  BarChart3,
  RefreshCw,
  Wallet,
  CalendarClock,
  ListTodo,
} from "lucide-react";
import ThemedLogo from "@/app/themed-logo";
import { getNewestHolding, getEventsCount, getTasksCount } from "@/lib/action";

// Events Count component that fetches and displays the total events count
function EventsCountDisplay() {
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEventsCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const count = await getEventsCount();
      setEventsCount(count);
    } catch (error) {
      console.error("Failed to fetch events count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventsCount();
    // Set refresh interval (e.g., every 2 minutes)
    const interval = setInterval(fetchEventsCount, 120000);
    return () => clearInterval(interval);
  }, [fetchEventsCount]);

  return (
    <div className="rounded-lg p-4 flex items-center gap-3">
      <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
        <CalendarClock className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"></div>
            <p className="text-xl font-semibold text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <p className="text-xl font-semibold">{eventsCount.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

// Tasks Count component that fetches and displays the total tasks count
function TasksCountDisplay() {
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTasksCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const count = await getTasksCount();
      setTasksCount(count);
    } catch (error) {
      console.error("Failed to fetch tasks count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasksCount();
    // Set refresh interval (e.g., every 2 minutes)
    const interval = setInterval(fetchTasksCount, 120000);
    return () => clearInterval(interval);
  }, [fetchTasksCount]);

  return (
    <div className="rounded-lg p-4 flex items-center gap-3">
      <div className="p-2 rounded-full bg-green-500/10 text-green-500">
        <ListTodo className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin"></div>
            <p className="text-xl font-semibold text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <p className="text-xl font-semibold">{tasksCount.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

// Total Value component that fetches and returns the total value asynchronously
function TotalValueDisplay() {
  const [totalValue, setTotalValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTotalValue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNewestHolding();
      if (data) {
        setTotalValue(data.totalBalanceUsd_notFiltered);
      }
    } catch (error) {
      console.error("Failed to fetch total value:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotalValue();
    // Set refresh interval (e.g., every 2 minutes)
    const interval = setInterval(fetchTotalValue, 120000);
    return () => clearInterval(interval);
  }, [fetchTotalValue]);

  return (
    <div className="rounded-lg p-4 flex items-center gap-3">
      <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
        <Wallet className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Total Holdings</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
            <p className="text-xl font-semibold text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <p className="text-xl font-semibold">${totalValue.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

export default function AgentProfile() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const address =
    process.env.NEXT_PUBLIC_APTOS_ADDRESS ||
    "No address set. It wont influnce backend";
  const agentStatus = "Active";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 0);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Mock agent statistics for the enhanced display
  const agentStats = {
    ActiveRate: "100%",
    queries: 1284,
    lastActive: "2 minutes ago",
    memoryUsage: 76,
    cpuLoad: 42,
  };

  return (
    <div className="bg-card-background rounded-xl border border-border shadow-sm mb-6 overflow-hidden">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-accent/20 to-transparent relative overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 relative z-10">
          <div className="flex items-center gap-4">
            <div>
              {/* <h2 className="text-sm font-medium text-muted-foreground">Agent Status</h2> */}
              <div className="flex items-center gap-4 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                <span className="font-semibold text-foreground">Agent Active</span>
              </div>
            </div>
          </div>
{/*           
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-accent/10 transition-colors border border-border">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent/10 transition-colors border border-border">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent/10 transition-colors border border-border">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div> */}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 pt-4 grid grid-cols-12 gap-6">
        {/* Left Column - Agent Identity */}
        <div className="col-span-4 flex flex-col items-center border-r border-border pr-6">
          <div className=" flex items-center justify-center mb-1  ">
            <ThemedLogo />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-center">
            BSC <span className="text-accent">AI</span>
          </h1>
          
          {/* <div className="flex gap-1.5 mt-2 mb-3">
            <span className="bg-accent/10 text-accent px-2.5 py-1 text-xs rounded-full border border-accent/20 font-medium">
              Agent
            </span>
            <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 text-xs rounded-full border border-blue-200 dark:border-blue-800 font-medium">
              v2.4.1
            </span>
          </div> */}
          
          <p className="text-sm text-muted-foreground mt-0.5 text-center max-w-sm">
            Blockchain Intelligence, Simplified — Powered by Advanced AI
          </p>
          
          {/* Address with copy functionality */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="mt-4 flex items-center gap-1.5 cursor-pointer group bg-secondary px-3 py-1.5 rounded-lg"
                  onClick={handleCopy}
                >
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {shortenAddress(address)}
                  </span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground border-border text-xs py-1 px-2">
                <p>{copied ? "Copied!" : "Copy full address"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* <button className="mt-5 w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition-colors rounded-lg py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </button> */}
        </div>
        
        {/* Right Column - Stats and Details */}
        <div className="col-span-8">
          {/* Tabs */}
          {/* <div className="flex items-center mb-5 border-b border-border">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2.5 font-medium text-sm relative ${
                activeTab === "stats" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Statistics
              {activeTab === "stats" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-4 py-2.5 font-medium text-sm relative ${
                activeTab === "config" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Configuration
              {activeTab === "config" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2.5 font-medium text-sm relative ${
                activeTab === "logs" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Activity Logs
              {activeTab === "logs" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"></span>
              )}
            </button>
          </div> */}
          
          {/* Statistics Content */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Active Rate</h3>
                  <p className="text-xl font-semibold">{agentStats.ActiveRate}</p>
                </div>
              </div>
              
              <EventsCountDisplay />
              
              <TasksCountDisplay />
              
              {/* Replaced Performance with Total Holdings */}
              <TotalValueDisplay />
              
              {/* <div className="col-span-2 bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">System Resources</h3>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </div>
                
             
              </div> */}
            </div>
          )}
          
          {/* Configuration Tab Placeholder */}
          {activeTab === "config" && (
            <div className="p-6 text-center text-muted-foreground">
              Configuration settings would display here
            </div>
          )}
          
          {/* Logs Tab Placeholder */}
          {activeTab === "logs" && (
            <div className="p-6 text-center text-muted-foreground">
              Activity logs would display here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}