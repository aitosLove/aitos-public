"use client";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  Webhook,
  Antenna,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ArrowRightLeft,
  ArrowUpRight,
  MoreVertical,
  Loader2,
  Zap,
  Shield,
  Activity,
  Sparkles,
  Plus,
} from "lucide-react";
import { REFRESH_INTERVAL } from "./config";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Workflow {
  id: string;
  name: string;
  type: "scheduled" | "event" | "listener";
  status: "running" | "paused" | "failed";
  lastTriggered: string;
  description: string;
  metadata?: {
    frequency?: string;
    successRate?: number;
    nextRun?: string;
    priority?: "high" | "medium" | "low";
  };
  link: string;
}

// Animation constants
const STAGGER_DELAY = 60;

// Mock data fetching with updated content
const getWorkflows = async (): Promise<Workflow[]> => {
  return [
    {
      id: "1",
      name: "Market Monitor",
      type: "scheduled",
      status: "running",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Monitors token prices across multiple exchanges and alerts on significant changes",
      metadata: {
        frequency: "3 min",
        successRate: 99,
        nextRun: new Date(Date.now() + 180000).toLocaleTimeString(),
        priority: "high",
      },
      link: "/market-analysis",
    },
    {
      id: "2",
      name: "Portfolio Rebalancer",
      type: "event",
      status: "running",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Automatically adjusts portfolio allocations when market conditions meet predefined criteria",
      metadata: {
        frequency: "On trigger",
        successRate: 94,
        nextRun: "Waiting for event",
        priority: "medium",
      },
      link: "/portfolio-management",
    },
    {
      id: "3",
      name: "Telegram Auto Messenger",
      type: "listener",
      status: "running",
      lastTriggered: new Date(Date.now() - 3600000).toLocaleString(),
      description:
        "Automatically sends personalized messages to your Telegram contacts based on custom schedules and templates",
      metadata: {
        frequency: "Daily",
        successRate: 97,
        nextRun: "Today at 6:00 PM",
        priority: "medium",
      },
      link: "/telegram-messenger",
    }
  ];
};

// Updated WorkflowAutomations Component
export function WorkflowAutomations() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
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
    ? workflows.filter(
        (w) => w.status === activeFilter || w.type === activeFilter
      )
    : workflows;

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case "scheduled":
        return <CalendarClock className="h-5 w-5" />;
      case "event":
        return <Webhook className="h-5 w-5" />;
      case "listener":
        return <Antenna className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle2 className="h-4 w-4" />;
      case "paused":
        return <PauseCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "paused":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "failed":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "scheduled":
        return "bg-violet-500/10 text-violet-500";
      case "event":
        return "bg-amber-500/10 text-amber-500";
      case "listener":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden relative">
      {/* Decorative background elements */}
      {/* <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl bg-primary/5 pointer-events-none" />
      <div className="absolute -left-10 bottom-10 w-40 h-40 rounded-full blur-3xl bg-blue-500/5 pointer-events-none" /> */}

      {/* Header with controls */}
      <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Intelligent Workflows</h2>
            <p className="text-sm text-muted-foreground mt-0">
              Autonomous processes powering your strategy
            </p>
          </div>
        </div>
      </div>

      {/* Workflow cards with animation */}
      <div className="px-5 pt-0 pb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -3, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                className="bg-card/50 backdrop-blur-sm rounded-xl shadow-sm transition-all"
              >
                <div className="p-5">
                  {/* Header with priority indicator */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        p-3 rounded-xl 
                        ${getTypeColor(workflow.type)}
                      `}
                      >
                        {getWorkflowIcon(workflow.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {workflow.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`
                            inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full
                            ${getStatusColor(workflow.status)}
                          `}
                          >
                            {getStatusIcon(workflow.status)}
                            <span>{workflow.status}</span>
                          </span>

                          {workflow.metadata?.priority && (
                            <span
                              className={`
                              text-xs bg-card/80 border border-border/30 px-2 py-0.5 rounded-full flex items-center gap-1
                              ${
                                workflow.metadata.priority === "high"
                                  ? "text-amber-500"
                                  : ""
                              }
                              ${
                                workflow.metadata.priority === "medium"
                                  ? "text-blue-500"
                                  : ""
                              }
                              ${
                                workflow.metadata.priority === "low"
                                  ? "text-slate-500"
                                  : ""
                              }
                            `}
                            >
                              <Zap className="h-3 w-3" />
                              {workflow.metadata.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={workflow.link}>
                        <motion.button
                          className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-2">
                    {workflow.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}