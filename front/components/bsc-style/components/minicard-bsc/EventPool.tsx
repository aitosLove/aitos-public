// Event stream
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
  ArrowUpRight
} from "lucide-react";
import { getEvents } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";

type SystemEvent = {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  source: "API" | "Database" | "System" | "Scheduler";
  severity: "info" | "warning" | "critical";
  status: "pending" | "processing" | "completed" | "failed";
};

export function SystemEventStream() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "grouped">("timeline");
  const STAGGER_DELAY = 50;

  const mapEventData = (fetchedEvents: any[]): SystemEvent[] => {
    return fetchedEvents.map((item) => {
      const baseEvent = {
        id: item.id,
        name: item.type,
        timestamp: item.timestamp?.toISOString(),
        status: ["pending", "processing", "completed", "failed"][Math.floor(Math.random() * 4)]
      };

      switch (item.type) {
        case "UPDATE_HOLDING_EVENT":
          return {
            ...baseEvent,
            description: "Holding positions updated with latest market data",
            source: "Database",
            severity: "info"
          };

        case "UPDATE_PORTFOLIO_EVENT":
          return {
            ...baseEvent,
            description: "Portfolio allocations recalculated",
            source: "System",
            severity: "critical"
          };

        case "UPDATE_INSIGHT_EVENT":
          return {
            ...baseEvent,
            description: "Investment insights refreshed from analytics",
            source: "API",
            severity: "info"
          };

        case "UPDATE_RATE_EVENT":
          return {
            ...baseEvent,
            description: "Market rates updated from external feeds",
            source: "Scheduler",
            severity: "info"
          };
          case "TELEGRAM_REQUEST":
            return {
              ...baseEvent,
              description: "User requests from Telegram, agent should react",
              source: "System",
              severity: "info"
            };
  

        default:
          return {
            ...baseEvent,
            description: "System processing event",
            source: "System",
            severity: "info"
          };
      }
    });
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const fetchedEvents = await getEvents();
        if (fetchedEvents) setEvents(mapEventData(fetchedEvents));
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

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    event.description.toLowerCase().includes(filterValue.toLowerCase()) ||
    event.source.toLowerCase().includes(filterValue.toLowerCase())
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-rose-500/30 bg-rose-50/40 dark:border-rose-400/20 dark:bg-rose-950/30";
      case "warning":
        return "border-amber-500/30 bg-amber-50/40 dark:border-amber-400/20 dark:bg-amber-950/30";
      default:
        return "border-blue-500/30 bg-blue-50/40 dark:border-blue-400/20 dark:bg-blue-950/30";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "failed":
        return <XCircle className={`text-rose-500 ${iconClass}`} />;
      case "processing":
        return <ArrowRightLeft className={`text-amber-500 animate-pulse ${iconClass}`} />;
      case "pending":
        return <Clock className={`text-blue-500 ${iconClass}`} />;
      default:
        return <CheckCircle2 className={`text-emerald-500 ${iconClass}`} />;
    }
  };

  const getSourceIcon = (source: string) => {
    const iconClass = "h-5 w-5";
    switch (source) {
      case "API":
        return <Antenna className={`text-purple-600 ${iconClass}`} />;
      case "Database":
        return <Database className={`text-cyan-600 ${iconClass}`} />;
      case "System":
        return <Cpu className={`text-emerald-600 ${iconClass}`} />;
      case "Scheduler":
        return <CalendarClock className={`text-amber-600 ${iconClass}`} />;
      default:
        return <BellRing className={iconClass} />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden flex flex-col h-full max-h-[48rem]">
      {/* Header Section */}
      <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <BellRing className="h-6 w-6 text-lime-500" />
          </div>
          <div>
            <h1 className="text-lg text-accent font-semibold">Event Stream</h1>
            <p className="text-sm text-muted-foreground">Real-time portfolio system events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
        
          {/* <button
            onClick={handleRefresh}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button> */}
        </div>
      </div>

      {/* Event Display Area */}
      <div className="flex-grow overflow-y-auto p-5">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No events found
          </div>
        ) : viewMode === "timeline" ? (
          <div className="relative">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={` pb-6 relative ${getSeverityStyle(event.severity)} border rounded-xl p-4 mb-4 transition-all hover:shadow-md`}
                style={{ transitionDelay: `${index * STAGGER_DELAY}ms` }}
              >
                {/* <div className="absolute w-3 h-3 rounded-full bg-background border-2 -left-[14px] top-5 z-10"
                  style={{ borderColor: `var(--${event.severity})` }} /> */}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getSourceIcon(event.source)}
                    </div>
                    <div>
                      <h3 className="font-medium">{event.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      {/* <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                          {getStatusIcon(event.status)}
                          <span className="capitalize">{event.status}</span>
                        </span>
                        <span className="text-muted-foreground/80">·</span>
                        <span className="text-sm text-muted-foreground">
                          {event.source}
                        </span>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSeverityStyle(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border ${getSeverityStyle(event.severity)} transition-all hover:shadow-md`}
                style={{ transitionDelay: `${index * STAGGER_DELAY}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getSourceIcon(event.source)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{event.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSeverityStyle(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                    {/* <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(event.status)}
                        <span className="capitalize">{event.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <button className="hover:text-accent transition-colors">
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div> */}
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
