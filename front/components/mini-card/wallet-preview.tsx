"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { REFRESH_INTERVAL } from "./config";
import { getNewestHolding } from "@/lib/action";
import { Wallet } from "lucide-react";

// 类型定义
interface Position {
  token: string;
  value: number;
  color?: string;
}

// 颜色数组
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B89B3",
  "#957DAD",
  "#A8E6CF",
  "#DCEDC1",
];

// 仓位展示组件
export function PositionCard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [valueNotFiltered, setValueNotFiltered] = useState<number>(0);

  useEffect(() => {
    const refresh = () =>
      getNewestHolding().then((data) => {
        if (data) {
          setPositions(
            data.validPortfolio.map((item) => {
              return {
                token: item.coinSymbol,
                value: item.balanceUsd,
              };
            })
          );
          setValueNotFiltered(data.totalBalanceUsd_notFiltered);
        }
      });

    refresh();
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // 计算总价值和百分比
  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const otherValue = valueNotFiltered - totalValue;

  const positionsWithPercentage = positions.map((pos, index) => ({
    ...pos,
    percentage: ((pos.value / totalValue) * 100).toFixed(2),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Portfolio on SUI
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={positionsWithPercentage}
                  dataKey="value"
                  nameKey="token"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="#000000"
                >
                  {positionsWithPercentage.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">
                ${totalValue.toLocaleString()} + ${otherValue.toLocaleString()}
                (others)
              </p>
            </div>
            <div className="space-y-2">
              {positionsWithPercentage.map((pos) => (
                <div
                  key={pos.token}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pos.color }}
                    />
                    <span className="font-medium">{pos.token}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${pos.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{pos.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
