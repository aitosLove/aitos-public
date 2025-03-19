"use client";
import { Clock, Zap, Database, Cpu } from "lucide-react";
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
  type: "automation" | "api" | "data" | "system";
};

export default function EventPool() {
  const [events, setEvents] = useState<Event[]>([]);

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
              type: mapEventType(item.type),
            }))
          );
        }
      });

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const mapEventType = (type: string): Event["type"] => {
    const typeMap: Record<string, Event["type"]> = {
      automation: "automation",
      api: "api",
      data: "data",
      system: "system",
    };
    return typeMap[type.toLowerCase()] || "system";
  };

  const getEventIcon = (type: Event["type"]) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case "automation":
        return <Zap className={`${iconClass} text-purple-600`} />;
      case "api":
        return <Cpu className={`${iconClass} text-blue-600`} />;
      case "data":
        return <Database className={`${iconClass} text-green-600`} />;
      default:
        return <Zap className={`${iconClass} text-gray-600`} />;
    }
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

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {/* <Clock className="text-sky-500" size={18} /> */}
          Event Pool
        </h2>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        <Timeline>
          {events.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineSeparator>
                <TimelineDot className="text-sky-300 dark:text-sky-800">
                  {/* {getEventIcon(event.type)} */}
                </TimelineDot>
                {index < events.length - 1 && (
                  <TimelineConnector className="bg-sky-200 dark:bg-sky-900" />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <TimelineTitle>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm text-primary">
                      {event.name}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </TimelineTitle>
                <TimelineDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    {event.description}
                  </p>
                </TimelineDescription>
                {/* <div className="ml-4 p-4 bg-gray-50 rounded-lg hover:bg-white transition-all">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm text-gray-900">
                      {event.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {event.description}
                  </p>
                </div> */}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </div>
  );
}
