// components/SuiAnalysisMiniCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInsights } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import { Blocks, ArrowUp, ArrowDown, Clock } from "lucide-react";

type MarketData = {
  ethBtcTrend: string;
  suiPerformance: Array<{
    metric: string;
    change: string;
    insight: string;
  }>;
  ecosystemMetrics: Array<{
    indicator: string;
    change: string;
    insight: string;
  }>;
  lastUpdated: string;
};

const parseMiniMarkdown = (content: string): MarketData => {
  const data: MarketData = {
    ethBtcTrend: '',
    suiPerformance: [],
    ecosystemMetrics: [],
    lastUpdated: new Date().toISOString()
  };

  // 提取关键趋势
  const trendMatch = content.match(/Key Trend: ([\s\S]*?)(?=\n-|\n##|$)/);
  data.ethBtcTrend = trendMatch?.[1].replace(/\*\*/g, '') || '';

  // 提取SUI性能指标
  data.suiPerformance = Array.from(content.matchAll(/- \*\*(SUI\/.*?):\*\* (.*?) - ([\s\S]*?)(?=\n-|$)/g))
    .map(([_, metric, change, insight]) => ({
      metric: metric.replace(/\(.*?\)/g, '').trim(),
      change: change.match(/[+-]?\d+\.\d+%/)?.toString() || '',
      insight: insight.replace(/\*\*/g, '').trim()
    }));

  // 提取生态系统指标
  const tableContent = content.split('| **Indicator**')[1]?.split('\n---')[0];
  if (tableContent) {
    data.ecosystemMetrics = tableContent
      .split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const cols = line.split('|')
          .slice(1, -1)
          .map(c => c.replace(/\*\*/g, '').trim());
        return {
          indicator: cols[0],
          change: cols[1],
          insight: cols[2] || ''
        };
      });
  }

  return data;
};

export const MarketAnalysisCard = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    ethBtcTrend: '',
    suiPerformance: [],
    ecosystemMetrics: [],
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insights = await getInsights();
        if (insights?.[0]?.insight) {
          setMarketData(parseMiniMarkdown(insights[0].insight));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getTrend = (value: string) => {
    if (value.startsWith('+')) return 'up';
    if (value.startsWith('-')) return 'down';
    return 'stable';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="gap-2 text-lg font-semibold flex">
            <Blocks size={18} />
            SUI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading market data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="gap-2 text-lg font-semibold flex">
            <Blocks size={18} />
            SUI Analysis
          </CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            {new Date(marketData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 市场趋势 */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">ETH/BTC Trend</h3>
          <p className="text-xs text-gray-600 line-clamp-2">
            {marketData.ethBtcTrend}
          </p>
        </div>

        {/* 性能指标 */}
        <div className="grid grid-cols-2 gap-2">
          {marketData.suiPerformance.map((metric, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">{metric.metric}</span>
                <span className={`text-xs ${
                  getTrend(metric.change) === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {metric.insight}
              </p>
            </div>
          ))}
        </div>

        {/* 生态系统指标 */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px]">
            <tbody>
              {marketData.ecosystemMetrics.map((metric, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 text-xs font-medium">{metric.indicator}</td>
                  <td className="py-2 text-right">
                    <span className={`inline-flex items-center ${
                      getTrend(metric.change) === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                      {getTrend(metric.change) === 'up' ? (
                        <ArrowUp size={12} className="ml-1" />
                      ) : (
                        <ArrowDown size={12} className="ml-1" />
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
