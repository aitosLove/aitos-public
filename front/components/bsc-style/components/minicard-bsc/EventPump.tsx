"use client";
import { useEffect, useState } from "react";
import { 
  Clock, 
  Timer, 
  Webhook, 
  Radio, 
  MoreHorizontal, 
  Activity,
  PlusCircle, 
  RefreshCw,
  Zap,
  Database,
  Cpu,
  Filter,
  Search,
  BarChart3,
  AlarmCheck,
  Globe2,
  Antenna,
  ArrowUpRight,
  Settings,
  CheckCircle2,
  XCircle,
  PauseCircle,
  BadgeInfo,
  ArrowRightLeft,
  CalendarClock,
  BellRing
} from "lucide-react";
import { getEvents } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import Link from "next/link";

// Types
interface Workflow {
  id: string;
  name: string;
  type: "timer" | "hook" | "listener";
  status: "active" | "standby" | "error";
  lastTriggered: string;
  description: string;
  metadata?: {
    frequency?: string;
    successRate?: number;
    nextRun?: string;
  };
  link:string
}

type SystemEvent = {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  source?: string;
  severity?: "info" | "warning" | "critical";
  status?: "pending" | "processing" | "completed" | "failed";
};

// Animation constants
const STAGGER_DELAY = 50;

// Mock data fetching
const getWorkflows = async (): Promise<Workflow[]> => {
  return [
    {
      id: "1",
      name: "Market Insight Update",
      type: "timer",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description: "Updates market insights every 5 minutes to provide the latest analysis and trends.",
      metadata: {
        frequency: "5 min",
        successRate: 98,
        nextRun: new Date(Date.now() + 180000).toLocaleTimeString()
      },
      link:"/aptos-market"
    },
    {
      id: "2",
      name: "Portfolio Data Update",
      type: "hook",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description: "Refreshes portfolio data every 10 minutes to keep track of the latest asset values and performance.",
      metadata: {
        frequency: "10 min",
        successRate: 92,
        nextRun: new Date(Date.now() + 360000).toLocaleTimeString()
      },
      link:"/portfolio"

    },
    {
      id: "3",
      name: "Adjust Portfolio",
      type: "listener",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description: "Automatically adjusts the portfolio whenever new market insights are available, ensuring optimal asset allocation.",
      metadata: {
        frequency: "On event",
        successRate: 86,
        nextRun: "Waiting for trigger"
      },
      link:"/portfolio"

    }
  ];
};

// Component for Workflow Section (formerly EventPump)
export function WorkflowAutomations() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Animation state
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const data = await getWorkflows();
      setWorkflows(data);
    };

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);

    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 100);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await getWorkflows();
    setWorkflows(data);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredWorkflows = activeFilter 
    ? workflows.filter(w => w.status === activeFilter || w.type === activeFilter)
    : workflows;

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case "timer":
        return <CalendarClock className="h-5 w-5" />;
      case "hook":
        return <Webhook className="h-5 w-5" />;
      case "listener":
        return <Antenna className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "standby":
        return <PauseCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <BadgeInfo className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "standby":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50";
      case "error":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/50";
    }
  };

  return (
    <div className="bg-gradient-to-br from-card-background to-card rounded-xl border border-border shadow-md overflow-hidden">
      {/* Header with controls */}
      <div className="p-5 border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-accent/10 p-1.5 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-accent">Workflow Automations</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">Intelligent processes running your system</p>
        </div>

        {/* <div className="flex items-center gap-2 ml-9 sm:ml-0">
          <div className="flex bg-muted/50 rounded-lg p-1 text-xs font-medium">
            <button 
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === null ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveFilter(null)}
            >
              All
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveFilter(activeFilter === 'active' ? null : 'active')}
            >
              Active
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'error' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveFilter(activeFilter === 'error' ? null : 'error')}
            >
              Issues
            </button>
          </div>
          
          <button 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div> */}
      </div>
      
      {/* Workflow cards with animation */}
      <div className="px-2 pt-0 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className={`
                transform transition-all duration-300 ease-out
                ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                rounded-xl border bg-gradient-to-b from-card/80 to-card shadow-sm hover:shadow-md transition-all
                ${workflow.status === 'active' ? 'border-emerald-500/20 dark:border-emerald-800/30' : ''}
                ${workflow.status === 'error' ? 'border-rose-500/20 dark:border-rose-800/30' : ''}
                ${workflow.status === 'standby' ? 'border-blue-500/20 dark:border-blue-800/30' : ''}
                ${workflow.status === 'active' ? 'hover:border-emerald-500/40' : ''}
                ${workflow.status === 'error' ? 'hover:border-rose-500/40' : ''}
                ${workflow.status === 'standby' ? 'hover:border-blue-500/40' : ''}
              `}
              style={{ transitionDelay: `${index * STAGGER_DELAY}ms` }}
            >
              <div className="p-3">
                {/* Header with status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className={`
                      p-3 rounded-xl
                      ${workflow.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400' : ''}
                      ${workflow.status === 'error' ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400' : ''}
                      ${workflow.status === 'standby' ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400' : ''}
                    `}>
                      {getWorkflowIcon(workflow.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{workflow.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`
                          inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full
                          ${getStatusColor(workflow.status)}
                        `}>
                          {getStatusIcon(workflow.status)}
                          {workflow.status}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                          {workflow.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link href={workflow.link} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <button className="text-xs flex items-center gap-1 text-accent hover:text-accent/80 font-medium">
                    <span>Details</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                  </Link>

                </div>
                  
                
                {/* Description */}
                <p className="text-sm text-muted-foreground pl-16">
                  {workflow.description}
                </p>
                
                {/* Metadata and stats */}
                {/* <div className="mt-5 pl-16 grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Frequency</span>
                    <span className="text-sm font-medium">{workflow.metadata?.frequency}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">{workflow.metadata?.successRate}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Next Run</span>
                    <span className="text-sm font-medium font-mono">{workflow.metadata?.nextRun}</span>
                  </div>
                </div> */}
                
              
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

