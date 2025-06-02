// components/EventPool.tsx
"use client";
import {
  Clock,
  Zap,
  Database,
  Cpu,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getEvents } from "@/lib/action";
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

type Event = {
  id: string;
  name: string;
  description: string;
  timestamp: string;
};

export default function EventPool() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    const refresh = () =>
      getEvents().then((data) => {
        if (data) {
          setEvents(
            data.map((item) => ({
              id: item.id,
              name: item.type,
              description: item.description,
              timestamp: item.timestamp?.toISOString(),
            }))
          );
        }
      });

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    getEvents().then((data) => {
      if (data) {
        setEvents(
          data.map((item) => ({
            id: item.id,
            name: item.type,
            description: item.description,
            timestamp: item.timestamp?.toISOString(),
          }))
        );
      }
      setTimeout(() => setIsRefreshing(false), 800);
    });
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

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      event.description.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border h-full shadow-sm overflow-hidden flex flex-col max-h-[48rem]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">Event Pool</h2>
          <p className="text-sm text-muted-foreground mt-1">
            System event monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw
              className={`h-5 w-5 text-muted-foreground ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter events..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2 ">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No events found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Events will appear here when processed
            </p>
          </div>
        ) : (
          <Timeline className="space-y-4">
            {filteredEvents.map((event, index) => (
              <TimelineItem key={event.id} className="group">
                <TimelineSeparator>
                  <TimelineDot className="size-3 text-slate-500" />
                  {index < filteredEvents.length - 1 && (
                    <TimelineConnector className="h-14 mt-1" />
                  )}
                </TimelineSeparator>
                <TimelineContent className="mt-0 mb-0 py-1">
                  <div className="bg-card/50 group-hover:bg-muted/50 p-3 rounded-lg border border-transparent group-hover:border-border transition-all duration-200">
                    <TimelineTitle>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm text-primary">
                            {event.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </TimelineTitle>
                    <TimelineDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {event.description}
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
