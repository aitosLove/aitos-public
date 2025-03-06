"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewestMarketState, getInsights } from "@/lib/action";
import { Brain, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { REFRESH_INTERVAL } from "./config";

// 类型定义
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

// 市场情况
export function MarketPerception() {
  const [ratios, setRatios] = useState<RatioData[]>([]);

  const timeframes: TimeFrame[] = ["1h", "1d", "3d", "7d", "30d"];

  useEffect(() => {
    const refresh = () =>
      getNewestMarketState().then((data) => {
        if (data) {
          setRatios(data);
        }
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const renderChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <div
        className={`flex items-center ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
        <span className="ml-1">{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Market Perception
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-background">
                    <th className="p-2 text-left font-medium">Pair</th>
                    {timeframes.map((tf: TimeFrame) => (
                      <th key={tf} className="p-2 text-left font-medium">
                        {tf}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ratios.map((ratio: RatioData, idx: number) => (
                    <tr
                      key={ratio.pair}
                      className={idx !== ratios.length - 1 ? "border-b" : ""}
                    >
                      <td className="p-2 font-medium">{ratio.pair}</td>
                      {timeframes.map((tf: TimeFrame) => (
                        <td key={tf} className="p-2">
                          <div className="flex items-center justify-between">
                            <span>
                              {(ratio[tf] as PriceData).value.toFixed(6)}
                            </span>
                            {renderChange((ratio[tf] as PriceData).change)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
