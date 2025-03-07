"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { getInsights } from "@/lib/action";
import { Brain, ChevronRight, ChevronLeft, ArrowUpDown } from "lucide-react";
import { REFRESH_INTERVAL } from "./config";

interface Thought {
  id: string;
  topic: string;
  content: string;
  timestamp: string;
}

// 思考展示组件

// ThoughtStream 组件
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

  return (
    <Card className="w-full ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold ">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6" />
            Thought Stream (Driven by Atoma & DeepSeek)
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-gray-300" />
          </button>
          <span className="text-gray-300">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {currentThought && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-cyan-400">
                {currentThought.topic}
              </h3>
              <span className="text-sm text-gray-400">
                {formatTimestamp(currentThought.timestamp)}
              </span>
            </div>
            <div className="mt-4 prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Heading styles
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-100 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-100 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-gray-100 mb-2">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-bold text-gray-100 mb-2">
                      {children}
                    </h4>
                  ),

                  // Text content styles
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),

                  // List styles
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 text-gray-300 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,

                  // Block quote styles
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 mb-4">
                      {children}
                    </blockquote>
                  ),
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
