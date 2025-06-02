"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFRESH_INTERVAL } from "./config";
import { getActions, PositionHistory } from "@/lib/action";
import { History, ChevronDown, ChevronUp, Calendar, Clock, Info, BarChart2, PieChart, ListFilter, Activity } from "lucide-react";
import { TokenOnTargetPortfolio } from "@/types/portfolio";
import { getTokenColor, getOthersColor } from "@/lib/tokenColors";

// Portfolio adjustment history component
export function PositionHistoryCard() {
  const [history, setHistory] = useState<PositionHistory[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(0); // Default to first item expanded

  useEffect(() => {
    const refresh = () =>
      getActions().then((data) => {
        if (data) {
          setHistory(data);
          // Reset expanded item to 0 when new data comes in
          setExpandedItem(0);
        }
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (index: number) => {
    if (expandedItem === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem(index);
    }
  };

  // Helper to find allocation changes between adjustments
  const findAllocationChanges = (currentItem: PositionHistory, index: number) => {
    if (index === history.length - 1) {
      // First adjustment, no previous allocation to compare
      return null;
    }
    
    const previousPortfolio = history[index + 1].details.target_portfolio;
    const currentPortfolio = currentItem.details.target_portfolio;
    
    const changes: Record<string, { previous: number, current: number, change: number }> = {};
    
    // Process previous allocations
    previousPortfolio.forEach((token: TokenOnTargetPortfolio) => {
      changes[token.coinSymbol] = {
        previous: token.targetPercentage,
        current: 0,
        change: -token.targetPercentage
      };
    });
    
    // Update with current allocations
    currentPortfolio.forEach((token: TokenOnTargetPortfolio) => {
      if (changes[token.coinSymbol]) {
        changes[token.coinSymbol].current = token.targetPercentage;
        changes[token.coinSymbol].change = token.targetPercentage - changes[token.coinSymbol].previous;
      } else {
        changes[token.coinSymbol] = {
          previous: 0,
          current: token.targetPercentage,
          change: token.targetPercentage
        };
      }
    });
    
    return changes;
  };

  // Sort portfolio by percentage for consistent display
  const sortPortfolio = (portfolio: TokenOnTargetPortfolio[]) => {
    return [...portfolio].sort((a, b) => b.targetPercentage - a.targetPercentage);
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Portfolio Adjustments</h2>
          <p className="text-sm text-muted-foreground mt-1">Historical portfolio rebalancing and adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
            <span>Showing {history.length} adjustments</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[56rem] overflow-y-auto pr-2">
        {history.length === 0 ? (
          <div className="p-8 rounded-lg border border-border/60 bg-card/50 text-center text-muted-foreground">
            No adjustment history available
          </div>
        ) : (
          history.map((item, index) => {
            const changes = findAllocationChanges(item, index);
            const isExpanded = expandedItem === index;
            
            return (
              <div
                key={index}
                className="rounded-lg border border-border/60 hover:border-border bg-card/50 hover:bg-muted/30 transition-all duration-200"
              >
                {/* Header with summary and timestamp */}
                <div 
                  className="p-4 flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/5 rounded-full">
                      <History className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-primary">
                        {index === 0 ? "Latest Rebalance" : `Rebalance #${history.length - index}`}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-0.5 text-wrap mr-8">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4 min-w-16">
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(item.timestamp.toISOString())}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(item.timestamp.toISOString())}
                    </div>
                    <div className="mt-2">
                      <button className="p-1 rounded-full hover:bg-muted transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded content with allocation details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/40">
                    {/* Changes visualization if available */}
                    {changes && (
                      <div className="mb-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                            <BarChart2 className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                          </div>
                          <h4 className="text-sm font-medium text-primary">Allocation Changes</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs bg-muted/10 p-3 rounded-md">
                          <div className="font-medium text-muted-foreground">Asset</div>
                          <div className="font-medium text-right text-muted-foreground">Previous</div>
                          <div className="font-medium text-right text-muted-foreground">Current</div>
                          <div className="font-medium text-right text-muted-foreground">Change</div>
                          
                          {Object.entries(changes)
                            .sort(([, a], [, b]) => Math.abs(b.change) - Math.abs(a.change))
                            .map(([symbol, data]) => (
                              <React.Fragment key={symbol}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: getTokenColor(symbol) }} 
                                  />
                                  {symbol}
                                </div>
                                <div className="text-right">{data.previous}%</div>
                                <div className="text-right">{data.current}%</div>
                                <div className={`text-right font-medium ${
                                  data.change > 0 
                                    ? 'text-emerald-700 dark:text-emerald-400' 
                                    : data.change < 0 
                                      ? 'text-rose-700 dark:text-rose-400' 
                                      : ''
                                }`}>
                                  {data.change > 0 ? '+' : ''}{data.change}%
                                </div>
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Target portfolio visualization */}
                    <div className="mb-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                          <PieChart className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-medium text-primary">Target Portfolio</h4>
                      </div>
                      <div className="flex items-center mb-4">
                        {sortPortfolio(item.details.target_portfolio).map((token) => (
                          <div 
                            key={token.coinSymbol}
                            className="h-7 first:rounded-l-md last:rounded-r-md flex items-center justify-center text-xs text-white font-medium"
                            style={{
                              width: `${token.targetPercentage}%`,
                              backgroundColor: getTokenColor(token.coinSymbol),
                              minWidth: '30px'
                            }}
                            title={`${token.coinSymbol}: ${token.targetPercentage}%`}
                          >
                            {token.targetPercentage}%
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Detailed allocation table */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-violet-50 dark:bg-violet-950/30 rounded-full">
                          <ListFilter className="h-3.5 w-3.5 text-violet-700 dark:text-violet-400" />
                        </div>
                        <h4 className="text-sm font-medium text-primary">Asset Breakdown</h4>
                      </div>
                      <div className="bg-muted/10 p-3 rounded-md">
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2 border-b border-border/40 pb-2">
                          <div className="font-medium text-muted-foreground">Asset</div>
                          <div className="font-medium text-right text-muted-foreground">Target %</div>
                          <div className="font-medium text-right text-muted-foreground">Type</div>
                        </div>
                        
                        <div className="space-y-2">
                          {sortPortfolio(item.details.target_portfolio).map((token) => (
                            <div key={token.coinSymbol} className="grid grid-cols-3 gap-2 text-sm hover:bg-muted/20 py-1 px-1 rounded-sm transition-colors">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: getTokenColor(token.coinSymbol) }} 
                                />
                                {token.coinSymbol}
                              </div>
                              <div className="text-right font-medium">{token.targetPercentage}%</div>
                              <div className="text-right text-xs text-muted-foreground truncate" title={token.coinType}>
                                {token.coinType.substring(0, 10)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>Automatically updated on portfolio changes</span>
        </div>
      </div>
    </div>
  );
}
