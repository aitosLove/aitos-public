// components/AgentMetrics.tsx
"use client"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Metric = {
  label: string
  value: string
  trend: "up" | "down" | "stable"
}

export default function AgentMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])

  // 模拟独立数据获取
  useEffect(() => {
    const fetchMetrics = async () => {
      // 模拟API调用
      setTimeout(() => {
        setMetrics([
          { label: "Pump active rate", value: "100%", trend: "up" },
          { label: "Events", value: "24 event/day", trend: "stable" },
          { label: "Tasks", value: "17 task/day", trend: "up" }
        ])
      }, 300)
    }

    fetchMetrics()
  }, [])

  return (

    <div className="flex-[2] w-full grid grid-cols-1 md:grid-cols-3 gap-4">

      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  )
}

function MetricCard({ label, value, trend }: Metric) {
  return (
    <div className="bg-background p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={cn(
          "h-2 w-2 rounded-full",
          trend === 'up' ? 'bg-green-400' : '',
          trend === 'down' ? 'bg-red-400' : '',
          trend === 'stable' ? 'bg-yellow-400' : ''
        )} />
      </div>

      <div className="text-lg md:text-xl font-semibold mt-2">{value}</div>

    </div>
  )
}
