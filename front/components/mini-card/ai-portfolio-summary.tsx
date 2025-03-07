// components/AIPortfolioMiniCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNewestHolding, getActions } from "@/lib/action";
import { REFRESH_INTERVAL } from "./config";
import { Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

// 类型定义
interface Position {
  token: string;
  value: number;
  color?: string;
}

export const AIPortfolioSummary: React.FC = () => {
  const [holdings, setHoldings] = useState<Position[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [performance, setPerformance] = useState<number>(0); // 假设24小时收益率

  useEffect(() => {
    const fetchData = async () => {
      const holding = await getNewestHolding();
      if (holding) {
        const positions = holding.validPortfolio.map((item) => ({
          token: item.coinSymbol,
          value: item.balanceUsd,
        }));
        setHoldings(positions);
        setTotalValue(holding.totalBalanceUsd_notFiltered);
        // 模拟24小时收益率，实际需替换为真实数据
        setPerformance((Math.random() - 0.5) * 10); // -5% 到 +5%
      }
    };
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (holdings.length === 0) {
    return (
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            AI Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">loading...</p>
        </CardContent>
      </Card>
    );
  }

  const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);
  const topHoldings = sortedHoldings.slice(0, 3);
  const othersValue =
    sortedHoldings.length > 3
      ? sortedHoldings.slice(3).reduce((sum, h) => sum + h.value, 0)
      : 0;

  const pieData = [
    ...topHoldings.map((h) => ({ name: h.token, value: h.value })),
    ...(othersValue > 0 ? [{ name: "其他", value: othersValue }] : []),
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const renderPerformance = (change: number) => {
    const isPositive = change > 0;
    return (
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    );
  };

  return (
    <Card className="w-full max-w-sm shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Wallet className="h-5 w-5 " />
          AI Portfolio Module
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-gray-800">
            ${totalValue.toLocaleString()}
          </p>
          {/* <p className="text-sm text-gray-600">
            24h change: {renderPerformance(performance)}
          </p> */}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={50}
                fill="#8884d8"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 text-sm">
          {topHoldings.map((holding, index) => (
            <div key={index} className="flex justify-between">
              <span>{holding.token}</span>
              <span>{((holding.value / totalValue) * 100).toFixed(1)}%</span>
            </div>
          ))}
          {othersValue > 0 && (
            <div className="flex justify-between">
              <span>其他</span>
              <span>{((othersValue / totalValue) * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPortfolioSummary;
