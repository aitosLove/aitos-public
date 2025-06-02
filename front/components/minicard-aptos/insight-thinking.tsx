"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getInsights } from "@/lib/action";
import { ChevronRight, ChevronLeft, Activity, LightbulbIcon, RefreshCw } from "lucide-react";
import { REFRESH_INTERVAL } from "./config";
import remarkGfm from "remark-gfm";

interface Thought {
  id: string;
  topic: string;
  content: string;
  timestamp: string;
}

export function ThoughtStream() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const refresh = async () => {
      const data = await getInsights();
      if (data) {
        setThoughts(
          data.map((item) => {
            return {
              id: item.id,
              topic: "Market Insight",
              content: item.insight,
              timestamp: item.timestamp.toISOString(),
            };
          })
        );
      }
    };

    refresh(); // Initial fetch on component load
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    
    return () => clearInterval(interval); // Clean up timer when component unmounts
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await getInsights();
    if (data) {
      setThoughts(
        data.map((item) => {
          return {
            id: item.id,
            topic: "Market Insight",
            content: item.insight,
            timestamp: item.timestamp.toISOString(),
          };
        })
      );
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const currentThought = thoughts[currentPage];
  const totalPages = thoughts.length;

  const relativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Thought Stream</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-generated market insights and analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border/60 rounded-md">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-l-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-border/60"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded-r-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-border/60"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <button 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {currentThought && (
        <div className="p-4 rounded-lg border border-border/60 hover:border-border bg-card/50 transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/5 rounded-full">
              <LightbulbIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-primary">{currentThought.topic}</h3>
              <p className="text-xs text-muted-foreground/80">{formatTimestamp(currentThought.timestamp)} ({relativeTime(currentThought.timestamp)})</p>
            </div>
          </div>
          
          <div className="text-sm text-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                hr: () => <hr className="my-4 border-t border-border/50" />,
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mb-1">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground mb-3">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-3 border border-border rounded-md overflow-hidden">
                    <table className="w-full">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/30">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border/30">{children}</tbody>
                ),
                tr: ({ children }) => <tr className="hover:bg-muted/10">{children}</tr>,
                th: ({ children }) => (
                  <th className="p-2 text-left text-sm font-medium">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="p-2 text-sm">{children}</td>
                )
              }}
            >
              {currentThought.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 flex items-center">
        
        
        <div className="text-xs text-muted-foreground">
          <span>Scheduled market perception and deep reasoning</span>
        </div>
      </div>
    </div>
  );
}