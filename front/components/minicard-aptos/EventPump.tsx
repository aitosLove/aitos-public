// components/EventPump.tsx
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
  RefreshCw
} from "lucide-react";

interface EventPump {
  id: string;
  name: string;
  type: "timer" | "hook" | "listener";
  status: "active" | "standby" | "error";
  lastTriggered: string;
  description: string;
}

// Refresh interval (in milliseconds)
const REFRESH_INTERVAL = 60 * 1000;

// Simulate fetching event pump data
const getEventPumps = async (): Promise<EventPump[]> => {
  return [
    {
      id: "1",
      name: "Market Insight Update",
      type: "timer",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Updates market insights every 5 minutes to provide the latest analysis and trends.",
    },
    {
      id: "2",
      name: "Portfolio Data Update",
      type: "hook",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Refreshes portfolio data every 10 minutes to keep track of the latest asset values and performance.",
    },
    {
      id: "3",
      name: "Adjust Portfolio",
      type: "listener",
      status: "active",
      lastTriggered: new Date().toLocaleString(),
      description:
        "Automatically adjusts the portfolio whenever new market insights are available, ensuring optimal asset allocation.",
    },
  ];
};

export default function EventPumpSection() {
  const [eventPumps, setEventPumps] = useState<EventPump[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh data periodically
  useEffect(() => {
    const refresh = async () => {
      const data = await getEventPumps();
      setEventPumps(data);
    };

    refresh(); // Initial fetch on component load
    const interval = setInterval(refresh, REFRESH_INTERVAL);

    return () => clearInterval(interval); // Clean up timer when component unmounts
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await getEventPumps();
    setEventPumps(data);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getPumpTypeIcon = (type: string) => {
    switch (type) {
      case "timer":
        return <Timer className="h-4 w-4" />;
      case "hook":
        return <Webhook className="h-4 w-4" />;
      case "listener":
        return <Radio className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
      case "standby":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
      case "error":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Event Pump</h2>
          <p className="text-sm text-muted-foreground mt-1">Automated processes and triggers</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {eventPumps.map((pump) => (
          <div
            key={pump.id}
            className="p-4 rounded-lg border border-border/60 hover:border-border bg-card/50 hover:bg-muted/30 transition-all duration-200 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/5 rounded-full">
                  {getPumpTypeIcon(pump.type)}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-primary">{pump.name}</h3>
                  <p className="text-xs text-muted-foreground/80 capitalize">{pump.type}</p>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(pump.status)}`}>
                {pump.status}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground flex-grow">{pump.description}</p>
            
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>Last: {pump.lastTriggered}</span>
              </div>
              
            </div>
          </div>
        ))}      
      </div>
    </div>
  );
}