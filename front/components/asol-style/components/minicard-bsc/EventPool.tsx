"use client";
import { useEffect, useState } from "react";
import {
  Clock,
  Database,
  Cpu,
  CalendarClock,
  Antenna,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  BellRing,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  Activity,
  Filter,
  LayoutGrid,
  LayoutList,
  Search,
  MoreHorizontal,
  Shield,
} from "lucide-react";
import { getEvents } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import { motion, AnimatePresence } from "framer-motion";

interface SystemEvent {
  id: string;
  name: string;
  description: string;
  source: "Database" | "System" | "API" | "Scheduler";
  severity: "info" | "critical" | "warning" | "success";
  timestamp: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export function SystemEventStream() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "grouped">("timeline");
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const STAGGER_DELAY = 60;

  const mapEventData = (fetchedEvents: any[]): SystemEvent[] => {
    return fetchedEvents.map((item): SystemEvent => {
      const statuses: SystemEvent["status"][] = [
        "pending",
        "processing",
        "completed",
        "failed",
      ];

      const severities: SystemEvent["severity"][] = [
        "info",
        "warning",
        "critical",
        "success",
      ];

      const baseEvent = {
        id: String(item.id),
        name: item.type,
        timestamp: item.timestamp?.toISOString() || new Date().toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
      };

      switch (item.type) {
        case "UPDATE_HOLDING_EVENT":
          return {
            ...baseEvent,
            description:
              "Portfolio holdings updated with real-time market data",
            source: "Database",
            severity: "info",
          };
        case "UPDATE_PORTFOLIO_EVENT":
          return {
            ...baseEvent,
            description:
              "Strategic portfolio reallocation based on market conditions",
            source: "System",
            severity: "critical",
          };
        case "UPDATE_INSIGHT_EVENT":
          return {
            ...baseEvent,
            description:
              "AI-powered investment insights refreshed with latest analytics",
            source: "API",
            severity: "info",
          };
        case "UPDATE_RATE_EVENT":
          return {
            ...baseEvent,
            description:
              "Exchange rates synchronized across multiple liquidity pools",
            source: "Scheduler",
            severity: "info",
          };
        case "TELEGRAM_REQUEST":
          return {
            ...baseEvent,
            description:
              "User command received via secure messaging integration",
            source: "API",
            severity: "warning",
          };
        default:
          return {
            ...baseEvent,
            description: "System processing optimization completed",
            source: "System",
            severity: "info",
          };
      }
    });
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await getEvents();
        if (fetchedEvents) setEvents(mapEventData(fetchedEvents));

        // Trigger entrance animation
        setTimeout(() => setAnimateIn(true), 100);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    loadEvents();
    const interval = setInterval(loadEvents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fetchedEvents = await getEvents();
      if (fetchedEvents) setEvents(mapEventData(fetchedEvents));
    } catch (error) {
      console.error("Refresh failed:", error);
    }
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

  const filteredEvents = events
    .filter(
      (event) =>
        event.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        event.description.toLowerCase().includes(filterValue.toLowerCase()) ||
        event.source.toLowerCase().includes(filterValue.toLowerCase())
    )
    .filter((event) => !severityFilter || event.severity === severityFilter)
    .filter((event) => !sourceFilter || event.source === sourceFilter);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-rose-500/30 bg-rose-500/10 text-rose-500";
      case "warning":
        return "border-amber-500/30 bg-amber-500/10 text-amber-500";
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
      default:
        return "border-blue-500/30 bg-blue-500/10 text-blue-500";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "failed":
        return <XCircle className={`text-rose-500 ${iconClass}`} />;
      case "processing":
        return <ArrowRightLeft className={`text-amber-500 ${iconClass}`} />;
      case "pending":
        return <Clock className={`text-blue-500 ${iconClass}`} />;
      default:
        return <CheckCircle2 className={`text-emerald-500 ${iconClass}`} />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconClass = "h-4 w-4 mr-1";
    switch (severity) {
      case "critical":
        return <AlertTriangle className={`${iconClass}`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass}`} />;
      case "success":
        return <CheckCircle2 className={`${iconClass}`} />;
      default:
        return <Activity className={`${iconClass}`} />;
    }
  };

  const getSourceIcon = (source: string) => {
    const iconClass = "h-5 w-5";
    switch (source) {
      case "API":
        return <Antenna className={`text-violet-500 ${iconClass}`} />;
      case "Database":
        return <Database className={`text-blue-500 ${iconClass}`} />;
      case "System":
        return <Cpu className={`text-emerald-500 ${iconClass}`} />;
      case "Scheduler":
        return <CalendarClock className={`text-amber-500 ${iconClass}`} />;
      default:
        return <BellRing className={`text-primary ${iconClass}`} />;
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "API":
        return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case "Database":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "System":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Scheduler":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const countEventsBySeverity = (severity: string) => {
    return events.filter((event) => event.severity === severity).length;
  };

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden flex flex-col h-full max-h-[48rem] relative">
      {/* Decorative background elements */}
      {/* <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 bottom-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" /> */}

      {/* Header Section */}
      <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">System Event Stream</h1>
            <p className="text-sm text-muted-foreground">
              Real-time monitoring of platform activity
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
              placeholder="Search events..." 
              className="ml-2 bg-transparent outline-none w-full"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
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
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </motion.button>
        </div> */}
      </div>

      {/* Filter Chips */}
      {/* <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-border/30">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filters:</span>
        </div>
        
        {["info", "warning", "critical", "success"].map((severity) => (
          <motion.button
            key={severity}
            className={`
              text-xs px-2.5 py-1 rounded-full border flex items-center
              ${severityFilter === severity ? getSeverityStyle(severity) : 'border-border/30 bg-card/60 text-muted-foreground'}
            `}
            onClick={() => setSeverityFilter(severityFilter === severity ? null : severity)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {severityFilter === severity && getSeverityIcon(severity)}
            <span className="capitalize">{severity}</span>
            {countEventsBySeverity(severity) > 0 && (
              <span className="ml-1.5 bg-background/80 text-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                {countEventsBySeverity(severity)}
              </span>
            )}
          </motion.button>
        ))}
        
        {["API", "Database", "System", "Scheduler"].map((source) => (
          <motion.button
            key={source}
            className={`
              text-xs px-2.5 py-1 rounded-full border flex items-center
              ${sourceFilter === source ? getSourceBadgeColor(source) : 'border-border/30 bg-card/60 text-muted-foreground'}
            `}
            onClick={() => setSourceFilter(sourceFilter === source ? null : source)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{source}</span>
          </motion.button>
        ))}
        
        {(severityFilter || sourceFilter || filterValue) && (
          <motion.button
            className="text-xs px-2.5 py-1 rounded-full border border-border/30 bg-card/60 text-primary hover:bg-primary/10"
            onClick={() => {
              setSeverityFilter(null);
              setSourceFilter(null);
              setFilterValue("");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        )}
      </div> */}

      {/* Event Display Area */}
      <div className="flex-grow overflow-y-auto p-5 relative z-10">
        <AnimatePresence>
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-muted-foreground p-8"
            >
              <div className="bg-primary/5 p-4 rounded-full mb-4">
                <BellRing className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-center mb-2">No events found</p>
              <p className="text-sm text-center text-muted-foreground/70">
                Try adjusting your filters or wait for new events
              </p>
            </motion.div>
          ) : viewMode === "timeline" ? (
            <div className="relative space-y-4">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: animateIn ? 1 : 0,
                    y: animateIn ? 0 : 20,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden hover:shadow transition-all"
                >
                  {/* <div className={`h-1 ${getSeverityStyle(event.severity)}`} style={{ backgroundColor: `var(--${event.severity})` }} /> */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3  w-full">
                        {/* <div
                          className={`p-2 rounded-lg ${getSourceBadgeColor(
                            event.source
                          )}`}
                        >
                          {getSourceIcon(event.source)}
                        </div> */}
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {event.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                       
                        </div>
                        <div className="flex items-end justify-end flex-wrap gap-2 mt-0">
                            {/* <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getSeverityStyle(event.severity)}`}>
        {getSeverityIcon(event.severity)}
        <span className="capitalize">{event.severity}</span>
      </span> */}
                            {/* <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${event.status === "completed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : 
        event.status === "processing" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" : 
        event.status === "failed" ? "border-rose-500/30 bg-rose-500/10 text-rose-500" : 
        "border-blue-500/30 bg-blue-500/10 text-blue-500"}`}>
        {getStatusIcon(event.status)}
        <span className="capitalize">{event.status}</span>
      </span> */}
                            <span className="text-xs text-muted-foreground font-mono py-0 bg-background/50 rounded-full">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                      </div>
                      {/* <div className="flex items-center">
                        <motion.button
                          className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </motion.button>
                      </div> */}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: animateIn ? 1 : 0,
                    y: animateIn ? 0 : 20,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm overflow-hidden hover:shadow transition-all"
                >
                  <div
                    className={`h-1 ${getSeverityStyle(event.severity)}`}
                    style={{ backgroundColor: `var(--${event.severity})` }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getSourceBadgeColor(
                          event.source
                        )}`}
                      >
                        {getSourceIcon(event.source)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-foreground">
                            {event.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getSeverityStyle(
                              event.severity
                            )}`}
                          >
                            {getSeverityIcon(event.severity)}
                            <span className="capitalize">{event.severity}</span>
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
                              event.status === "completed"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                                : event.status === "processing"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                                : event.status === "failed"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                                : "border-blue-500/30 bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {getStatusIcon(event.status)}
                            <span className="capitalize">{event.status}</span>
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTimestamp(event.timestamp)}
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
