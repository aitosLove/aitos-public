"use client";

import React, { useState, useEffect } from "react";
import { REFRESH_INTERVAL } from "./config";
import { getPerplexitySearchesRecord } from "@/lib/action";
import { 
  Search, Activity, RefreshCw, ChevronDown, ChevronUp, 
  Copy, Check, Clock, User, Database, FileText, Tag, 
  BookOpen, BarChart4, PanelRight, PanelRightClose
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PerplexitySearch {
  id: number;
  query: string;
  response: string;
  model: string;
  timestamp: Date;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  citationTokens: number | null;
  searchQueriesCount: number | null;
  contentId: string;
  username: string;
  category: string;
  rawResponse: any | null;
  createdAt: Date;
}

export function DeepSearchDisplay() {
  const [searches, setSearches] = useState<PerplexitySearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSearches, setExpandedSearches] = useState<Set<number>>(new Set());
  const [showReasoning, setShowReasoning] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<string | null>(null);

  const fetchSearches = async () => {
    try {
      const data = await getPerplexitySearchesRecord();
      setSearches(data || []);
    } catch (err) {
      setError('Failed to fetch deep searches');
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
    fetchSearches();
    const interval = setInterval(fetchSearches, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchSearches();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleSearchExpansion = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSearches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleReasoningVisibility = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReasoning(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Function to split response into reasoning and report
  const parseResponse = (response: string) => {
    const thinkMatch = response.match(/<think>(.*?)<\/think>/s);
    let reasoning = thinkMatch ? thinkMatch[1].trim() : "";
    
    // Remove the thinking part from the response to get the report
    let report = response;
    if (thinkMatch) {
      report = response.replace(/<think>.*?<\/think>/s, "").trim();
    }
    
    return { reasoning, report };
  };

  const formatDatetime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Get unique categories and models for filtering
  const categories = [...new Set(searches.map(search => search.category))];
  const models = [...new Set(searches.map(search => search.model))];

  // Apply filters
  const filteredSearches = searches.filter(search => {
    if (categoryFilter && search.category !== categoryFilter) return false;
    if (modelFilter && search.model !== modelFilter) return false;
    return true;
  });

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Deep Search Results</h2>
          <p className="text-sm text-muted-foreground mt-1">Perplexity AI search queries and responses</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">Category:</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCategoryFilter(null)}
              className={`px-2 py-1 rounded text-xs ${categoryFilter === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded text-xs ${categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col ml-4">
          <span className="text-xs text-muted-foreground mb-1">Model:</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setModelFilter(null)}
              className={`px-2 py-1 rounded text-xs ${modelFilter === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              All
            </button>
            {models.map(model => (
              <button 
                key={model}
                onClick={() => setModelFilter(model)}
                className={`px-2 py-1 rounded text-xs ${modelFilter === model ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {model}
              </button>
            ))}
          </div>
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
            <p>{error}</p>
          </div>
        ) : filteredSearches.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No search results available
          </div>
        ) : (
          filteredSearches.map((search) => {
            const isExpanded = expandedSearches.has(search.id);
            const isReasoningVisible = showReasoning.has(search.id);
            const { reasoning, report } = parseResponse(search.response);
            const shouldTruncate = report.length > 150;
            const hasReasoning = reasoning.length > 0;
            
            return (
              <div 
                key={search.id}
                className="border-b border-border/30 last:border-0 py-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Search className="h-3.5 w-3.5" />
                      <span>Query</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{search.username}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs ">{formatDatetime(search.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(search.response, search.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Copy response"
                    >
                      {copiedId === search.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    {hasReasoning && (
                      <button 
                        onClick={(e) => toggleReasoningVisibility(search.id, e)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
                        title={isReasoningVisible ? "Hide reasoning" : "Show reasoning"}
                      >
                        {isReasoningVisible ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                      </button>
                    )}
                    {shouldTruncate && (
                      <button 
                        onClick={(e) => toggleSearchExpansion(search.id, e)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Query */}
                <div className="mb-2 bg-primary/10 p-2 rounded-lg">
                  <p className="font-medium text-muted-foreground text-xs">{search.query}</p>
                </div>

                {/* Response with Report and Reasoning */}
                <div className="flex gap-4">
                  {/* Main Report */}
                  <div className={`flex-1 ${shouldTruncate && !isExpanded ? 'max-h-64 overflow-hidden relative' : ''}`}>
                    <div className="post-content bg-primary/5 rounded-lg p-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-primary/10 prose-pre:p-2 prose-pre:rounded prose-headings:mt-2 prose-headings:mb-1"
                      >
                        {shouldTruncate && !isExpanded 
                          ? `${report.substring(0, 150)}...`
                          : report
                        }
                      </ReactMarkdown>
                    </div>
                    {shouldTruncate && !isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card-background to-transparent pointer-events-none"></div>
                    )}
                  </div>
                  
                  {/* Reasoning (conditionally shown) */}
                  {hasReasoning && isReasoningVisible && (
                    <div className="w-1/3 border-l border-border/30 pl-4">
                      <div className="mb-1 flex items-center">
                        <BookOpen className="h-3.5 w-3.5 text-amber-600 mr-1" />
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Reasoning</span>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg text-xs">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-xs max-w-none dark:prose-invert"
                        >
                          {reasoning}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Usage Stats & Metadata */}
                <div className="flex flex-wrap mt-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span className="font-medium text-primary">{search.model}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{search.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>ID: {search.contentId.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart4 className="h-3 w-3" />
                    <span>Tokens: {search.totalTokens}</span>
                    <span className="text-primary/50">({search.promptTokens} in / {search.completionTokens} out)</span>
                  </div>
                  {search.citationTokens && (
                    <div className="flex items-center gap-1">
                      <span>Citations: {search.citationTokens}</span>
                    </div>
                  )}
                  {search.searchQueriesCount && (
                    <div className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      <span>Searches: {search.searchQueriesCount}</span>
                    </div>
                  )}
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
        <span>Showing {filteredSearches.length} of {searches.length} search{searches.length !== 1 ? 'es' : ''}</span>
      </div>
    </div>
  );
}