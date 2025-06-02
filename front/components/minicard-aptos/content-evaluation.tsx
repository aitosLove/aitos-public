"use client";

import React, { useState, useEffect } from "react";
import { REFRESH_INTERVAL } from "./config";
import { getContentInsightsRecord } from "@/lib/action";
import {
  MessageSquare,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Lightbulb,
  Tag,
  Calendar,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Entity {
  name: string;
  context: string;
}

interface Event {
  name: string;
  details: string;
}

interface ContentInsight {
  id: number;
  hasValue: boolean;
  category: "trading_idea" | "project_intro" | "market_insight" | "none";
  summary: string;
  source: string;
  username: string;
  timestamp: Date;
  entity: Entity[] | unknown;  // Handle both Entity[] and unknown
  event: Event[] | unknown;    // Handle both Event[] and unknown
  createdAt: Date;
}

export function ContentEvaluation() {
  const [insights, setInsights] = useState<ContentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(
    new Set()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      const data = await getContentInsightsRecord();
      // Cast the data to ContentInsight[] to handle type conversion
      setInsights(data || []);
    } catch (err) {
      setError("Failed to fetch content insights");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchInsights();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleInsightExpansion = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedInsights((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "trading_idea":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
      case "project_intro":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "market_insight":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30";
      case "none":
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "trading_idea":
        return <Activity className="h-3.5 w-3.5" />;
      case "project_intro":
        return <Lightbulb className="h-3.5 w-3.5" />;
      case "market_insight":
        return <MessageSquare className="h-3.5 w-3.5" />;
      case "none":
      default:
        return <Tag className="h-3.5 w-3.5" />;
    }
  };

  const formatDatetime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Helper function to safely get array length
  const getArrayLength = (data: unknown): number => {
    if (Array.isArray(data)) {
      return data.length;
    }
    return 0;
  };

  // Helper function to check if entity data contains an array of Entity objects
  const isEntityArray = (data: unknown): data is Entity[] => {
    return Array.isArray(data) && 
      data.length > 0 && 
      typeof data[0] === 'object' && 
      data[0] !== null &&
      'name' in data[0] && 
      'context' in data[0];
  };

  // Helper function to check if event data contains an array of Event objects
  const isEventArray = (data: unknown): data is Event[] => {
    return Array.isArray(data) && 
      data.length > 0 && 
      typeof data[0] === 'object' && 
      data[0] !== null &&
      'name' in data[0] && 
      'details' in data[0];
  };

  const filteredInsights = categoryFilter
    ? insights.filter((insight) => insight.category === categoryFilter)
    : insights;

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Content Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Evaluated content from various sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-2 py-1 rounded text-xs ${
                categoryFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter("trading_idea")}
              className={`px-2 py-1 rounded text-xs ${
                categoryFilter === "trading_idea"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Trading
            </button>
            <button
              onClick={() => setCategoryFilter("project_intro")}
              className={`px-2 py-1 rounded text-xs ${
                categoryFilter === "project_intro"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setCategoryFilter("market_insight")}
              className={`px-2 py-1 rounded text-xs ${
                categoryFilter === "market_insight"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Market
            </button>
          </div>
          <button
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw
              className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[56rem] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="py-3 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-24 bg-primary/10 rounded"></div>
                  <div className="h-3 w-16 bg-primary/10 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-primary/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-3 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No insights available
          </div>
        ) : (
          filteredInsights.map((insight) => {
            const isExpanded = expandedInsights.has(insight.id);
            const shouldTruncate = insight.summary.length > 150;

            return (
              <div
                key={insight.id}
                className={`border-b border-border/30 last:border-0 py-3 ${
                  insight.hasValue ? "" : "opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(
                        insight.category
                      )}`}
                    >
                      {getCategoryIcon(insight.category)}
                      <span className="capitalize">
                        {insight.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{insight.username}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        {formatDatetime(insight.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(insight.summary, insight.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Copy insight"
                    >
                      {copiedId === insight.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {shouldTruncate && (
                      <button
                        onClick={(e) => toggleInsightExpansion(insight.id, e)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`${
                    shouldTruncate && !isExpanded
                      ? "max-h-32 overflow-hidden relative"
                      : ""
                  }`}
                >
                  <div className="post-content bg-primary/5 rounded-lg p-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-primary/10 prose-pre:p-2 prose-pre:rounded prose-headings:mt-2 prose-headings:mb-1"
                    >
                      {shouldTruncate && !isExpanded
                        ? `${insight.summary.substring(0, 150)}...`
                        : insight.summary}
                    </ReactMarkdown>
                  </div>
                  {shouldTruncate && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card-background to-transparent pointer-events-none"></div>
                  )}
                </div>

                <div className="flex mt-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Source:</span>
                    <span className="text-primary">{insight.source}</span>
                  </div>
                  {getArrayLength(insight.entity) > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Entities:</span>
                      <span>{getArrayLength(insight.entity)}</span>
                      {isEntityArray(insight.entity) && isExpanded && (
                        <span className="ml-1">
                          ({insight.entity.map(e => e.name).join(', ')})
                        </span>
                      )}
                    </div>
                  )}
                  {getArrayLength(insight.event) > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Events:</span>
                      <span>{getArrayLength(insight.event)}</span>
                      {isEventArray(insight.event) && isExpanded && (
                        <span className="ml-1">
                          ({insight.event.map(e => e.name).join(', ')})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <span>Value:</span>
                    {insight.hasValue ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          <span>Updates every {REFRESH_INTERVAL / 1000}s</span>
        </div>
        <span>
          Showing {filteredInsights.length} of {insights.length} insight
          {insights.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}