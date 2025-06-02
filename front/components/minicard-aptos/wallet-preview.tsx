"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { REFRESH_INTERVAL } from "./config";
import { getNewestHolding } from "@/lib/action";
import { Wallet, TrendingUp, Clock, RefreshCw, WalletIcon, BarChartIcon, CircleDollarSignIcon, Activity } from "lucide-react";
import {
  getTokenColor,
  assignTokenColors,
  getOthersColor,
} from "@/lib/tokenColors";

// Type definitions
interface Position {
  token: string;
  value: number;
  color?: string;
  percentage?: string;
}

// Color palette - more sophisticated and harmonious
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#84CC16", // Lime
  "#06B6D4", // Cyan
];

export function PositionCard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [valueNotFiltered, setValueNotFiltered] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeAgo, setTimeAgo] = useState<string>("0s ago");

  // Memoized function to calculate time ago
  const calculateTimeAgo = useCallback((lastUpdate: Date) => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }, []);

  // Effect to update time ago every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo(lastUpdated));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, calculateTimeAgo]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await getNewestHolding();
      if (data) {
        setPositions(
          data.validPortfolio.map((item) => ({
            token: item.coinSymbol,
            value: item.balanceUsd,
          }))
        );
        setValueNotFiltered(data.totalBalanceUsd_notFiltered);
        const now = new Date();
        setLastUpdated(now);
        setTimeAgo(calculateTimeAgo(now));
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Calculate total value and percentages
  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const otherValue = valueNotFiltered - totalValue;
  const totalWithOthers = totalValue + otherValue;

  const positionsWithPercentage = positions.map((pos) => ({
    ...pos,
    percentage: ((pos.value / totalValue) * 100).toFixed(1),
    color: getTokenColor(pos.token),
  }));

  // Add "Others" to chart data if significant
  const chartData = [...positionsWithPercentage];
  if (otherValue > 0) {
    chartData.push({
      token: "Others",
      value: otherValue,
      percentage: ((otherValue / totalWithOthers) * 100).toFixed(1),
      color: getOthersColor(),
    });
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border border-border shadow-lg">
          <p className="font-bold">{data.token}</p>
          <p className="text-sm">${data.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {data.percentage}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-1">Asset allocation and values</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>{timeAgo}</span>
          </div>
          <button 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group">
    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-emerald-400/20 to-emerald-600/20">
      <WalletIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="flex-grow">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
      <p className="text-xl font-bold text-primary">${totalWithOthers.toLocaleString()}</p>
    </div>
  </div>
  
  <div className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group">
    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-blue-400/20 to-blue-600/20">
      <BarChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-grow">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracked Assets</p>
      <p className="text-xl font-bold text-primary">${totalValue.toLocaleString()}</p>
    </div>
  </div>
  
  <div className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group">
    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-violet-400/20 to-violet-600/20">
      <CircleDollarSignIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
    </div>
    <div className="flex-grow">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Other Assets</p>
      <p className="text-xl font-bold text-primary">${otherValue.toLocaleString()}</p>
    </div>
  </div>
</div>
  
      <div className="flex flex-col md:flex-row gap-8">
        {/* Chart Section */}
        <div className="w-full md:w-1/2 p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="token"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={1}
                  strokeWidth={0}
                  stroke="#27272A"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Assets List */}
        <div className="w-full md:w-1/2 p-4 rounded-lg border border-border/60 bg-card/50">
          <div className="mb-3 pb-2 border-b border-border flex justify-between">
            <span className="font-medium text-sm text-primary">Asset</span>
            <span className="font-medium text-sm text-primary">Value / Allocation</span>
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {positionsWithPercentage.map((pos) => (
              <div
                key={pos.token}
                className="flex items-center justify-between py-1 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pos.color }}
                  />
                  <span className="font-medium text-sm">{pos.token}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${pos.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {pos.percentage}%
                  </p>
                </div>
              </div>
            ))}
            {otherValue > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 hover:bg-muted/10 transition-colors py-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-slate-300" />
                  <span className="font-medium text-sm">Others</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    ${otherValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((otherValue / totalWithOthers) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  
      <div className="mt-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>Auto-refreshes with market data</span>
        </div>
      </div>
    </div>
  );
}
