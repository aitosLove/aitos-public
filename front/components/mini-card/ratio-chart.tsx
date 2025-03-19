"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewestMarketState, getInsights } from "@/lib/action";
import { Brain, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { REFRESH_INTERVAL } from "./config";
import { Badge } from "@/components/ui/badge";

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
    <Card className="w-full shadow-sm hover:shadow-md border-0 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <Brain className="w-6 h-6 text-sky-600" /> */}
            <CardTitle className="text-xl font-semibold">
              Market Perception
            </CardTitle>
          </div>

          <div className="font-normal md:text-sm text-xs text-muted">
            <Badge variant="secondary" className="px-3 py-1 ">

              Updated every {REFRESH_INTERVAL / 1000}s
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="overflow-x-auto">
          {/* 固定表头阴影 */}
          <div className="sticky left-0 right-0 top-0 bg-gradient-to-b from-background via-background/80 to-transparent h-6 z-10" />

          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background z-20">
              <tr>
                <th className="p-2 text-left min-w-[120px] sticky left-0 bg-background z-30">
                  Pair
                </th>
                {timeframes.map((tf) => (
                  <th
                    key={tf}
                    className="p-2 text-center min-w-[100px] border-l border-gray-100"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{tf}</span>
                      <span className="text-xs text-gray-500">24h</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ratios.map((ratio) => (
                <tr
                  key={ratio.pair}
                  className="hover:bg-muted transition-colors"
                >
                  <td className="p-2 font-medium sticky left-0 bg-background z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-300" />
                      {ratio.pair}
                    </div>
                  </td>

                  {timeframes.map((tf) => {
                    const data = ratio[tf] as PriceData;
                    const isPositive = data.change > 0;

                    return (
                      <td
                        key={tf}
                        className="p-2 text-center border-l border-gray-100 relative group"
                      >
                        {/* 背景趋势条 */}
                        <div
                          className={`absolute inset-0 opacity-20 ${
                            isPositive ? "bg-green-400/80" : "bg-red-400/80"
                          }`}
                          style={{
                            width: `${Math.min(
                              // 使用对数缩放 (0-100% 对应 0%-1000% 变化率)
                              Math.log1p(Math.abs(data.change)) * 22, // 调整系数到合理范围
                              100
                            )}%`,
                          }}
                        />

                        <div className="relative z-10">
                          <div className="text-xs font-mono mb-1">
                            {data.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            {isPositive ? (
                              <ArrowUpIcon className="w-3 h-3 text-green-600" />
                            ) : (
                              <ArrowDownIcon className="w-3 h-3 text-red-600" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                isPositive ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              {Math.abs(data.change).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Hover状态显示完整数值 */}
                        {/* <div className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50">
                          Exact value: {data.value}
                        </div> */}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 横向滚动提示 */}
        {/* <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">
          ← Scroll →
        </div> */}
      </CardContent>
    </Card>
  );
}
