"use client";

import React, { useState, useEffect } from "react";
import { getNewestMarketState } from "@/lib/action";
import { Activity, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { REFRESH_INTERVAL } from "./config";

type TimeFrame = "1h" | "1d" | "3d" | "7d" | "30d";

interface PriceData {
  value: number;
  change: number;
}

interface RatioData {
  pair: string;
  [key: string]: PriceData | string;
  "1h": PriceData;
  "1d": PriceData;
  "3d": PriceData;
  "7d": PriceData;
  "30d": PriceData;
}

export function MarketPerception() {
  const [ratios, setRatios] = useState<RatioData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("1d");
  const timeframes: TimeFrame[] = ["1h", "1d", "3d", "7d", "30d"];

  useEffect(() => {
    const refresh = async () => {
      const data = await getNewestMarketState();
      if (data) {
        setRatios(data);
      }
    };

    refresh(); // Initial fetch on component load
    const interval = setInterval(refresh, REFRESH_INTERVAL);

    return () => clearInterval(interval); // Clean up timer when component unmounts
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await getNewestMarketState();
    if (data) {
      setRatios(data);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
    } else if (change < 0) {
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
    } else {
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700";
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 text-primary mr-2" /> 
            <span>Market Perception</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Market ratios and price movement indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
            onClick={handleManualRefresh}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      
      <div className="flex mb-4 space-x-2 overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedTimeframe === tf 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
            onClick={() => setSelectedTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs">
              <th className="p-3 text-left text-muted-foreground">Pair</th>
              {timeframes.map((tf) => (
                <th key={tf} className={`p-3 text-center ${tf === selectedTimeframe ? "text-accent font-medium" : "text-foreground font-medium"}`}>
                  {tf}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratios.map((ratio, index) => (
              <tr 
                key={ratio.pair}
                className={`border-t border-border/60 hover:bg-primary/5 transition-all duration-200 ${index === 0 ? "bg-primary/5" : ""}`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 rounded-full bg-primary/80"></div>
                    <div>
                      <h3 className="font-medium text-sm text-primary">{ratio.pair}</h3>
                      <p className="text-xs text-muted-foreground/80">trading pair</p>
                    </div>
                  </div>
                </td>
                
                {timeframes.map((tf) => {
                  const data = ratio[tf] as PriceData;
                  const isPositive = data.change > 0;
                  
                  return (
                    <td key={tf} className={`p-3 text-center ${tf === selectedTimeframe ? "bg-primary/5" : ""}`}>
                      <div className="mb-1">
                        <span className={`text-sm font-medium ${tf === selectedTimeframe ? "text-primary" : "text-primary/70"}`}>
                          {data.value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getChangeColor(data.change)}`}>
                        {isPositive ? 
                          <ArrowUp className="h-3 w-3" /> : 
                          <ArrowDown className="h-3 w-3" />
                        }
                        <span>{Math.abs(data.change).toFixed(1)}%</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span>Updates every {REFRESH_INTERVAL / 1000}s</span>
        </div>
       
      </div>
    </div>
  );
}