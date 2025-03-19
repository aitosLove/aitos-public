"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { getInsights } from "@/lib/action";
import { Brain, ChevronRight, ChevronLeft, ArrowUpDown } from "lucide-react";
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

  useEffect(() => {
    const refresh = () =>
      getInsights().then((data) => {
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
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const currentThought = thoughts[currentPage];
  const totalPages = thoughts.length;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThoughts = thoughts.filter((thought) =>
    thought.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Relative time formatter
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
    <Card className="w-full bg-background border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-primary">
          <div className="flex-col items-center gap-2">
            {/* <ArrowUpDown className="h-6 w-6 text-primary" /> */}
            Thought Stream
            <p className="text-sm font-normal">
            Driven by Atoma & DeepSeek
            </p>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-0 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="p-0 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {currentThought && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-primary">
                {currentThought.topic}
              </h3>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(currentThought.timestamp)}
              </span>
            </div>
            <div className="mt-4 prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="react-markdown"
                components={{
                  hr: () => (
                    <hr className="my-8 border-t-2 border-border/50" />
                  ),
                  // Heading styles
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-bold text-foreground mb-2">
                      {children}
                    </h4>
                  ),

                  // Text content styles
                  p: ({ children }) => (
                    <p className="text-card-foreground mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),

                  // List styles
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 text-card-foreground space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 text-card-foreground space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  

                  // Block quote styles
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-4">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 border rounded-lg overflow-y-auto text-xs">
                      <table className="w-full">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/50 border-b border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border/50">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="py-4 hover:bg-muted/20 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-2 py-3 text-left font-medium text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2 py-3 text-foreground">{children}</td>
                  )
                  
                }}
              >
                {currentThought.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
