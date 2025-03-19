// components/SuiAnalysisMiniCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getNewestMarketState, getInsights } from "@/lib/action";
import ReactMarkdown from "react-markdown";

import { REFRESH_INTERVAL } from "./config";
import { Blocks } from "lucide-react";

interface Thought {
  content: string;
  timestamp: string;
}

export const SuiAnalysisMiniCard = () => {
  const [insight, setInsight] = useState<Thought>({
    content: "",
    timestamp: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketData, insightsData] = await Promise.all([
          getNewestMarketState(),
          getInsights(),
        ]);
        setInsight(
          insightsData
            ? {
                content: insightsData[0].insight,
                timestamp: insightsData[0].timestamp.toISOString(),
              }
            : { content: "", timestamp: "" }
        ); // Take the most recent insight
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Sui Analysis data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle className="gap-2 text-lg font-semibold flex">
            {/* <Blocks /> */}
            Sui Analysis Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="gap-2 text-lg font-semibold flex">
          {/* <Blocks /> */}
          Sui Analysis Module
        </CardTitle>
        <CardDescription>
          Update Time :{new Date(insight.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            {insight ? (
              <ReactMarkdown
                components={{
                  // Heading styles
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold  mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold mb-2">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-bold mb-2">{children}</h4>
                  ),

                  // Text content styles
                  p: ({ children }) => (
                    <p className=" mb-4 leading-relaxed">{children}</p>
                  ),

                  // List styles
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4  space-y-2">
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
                {insight.content.substring(0, 600) + "..."}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-gray-500">No insights available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
