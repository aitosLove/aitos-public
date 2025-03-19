// components/PortfolioCard.tsx
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

export const PortfolioCard: React.FC = () => {
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
      <Card className="w-full max-w-lg shadow-none border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {/* <Wallet className="h-5 w-5" /> */}
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
    ...(othersValue > 0 ? [{ name: "Others", value: othersValue }] : []),
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
    <Card className="w-full max-w-xl shadow-none border-0 ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          AI Portfolio Module
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-1">
        <div className="text-left">
          <p className="text-3xl font-bold text-primary">
            ${totalValue.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-row md:flex-row items-center gap-6 lg:gap-8">
          <div className="w-full md:w-1/2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 space-y-2">
            {pieData.map((holding, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {/* 颜色块+代币名称 */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm font-medium">{holding.name}</span>
                </div>

                {/* 数值信息 */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    ${holding.value.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono w-12 text-right">
                    {((holding.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
