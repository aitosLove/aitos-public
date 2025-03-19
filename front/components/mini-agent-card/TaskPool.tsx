"use client"
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { getTasks } from "@/lib/action"
import { REFRESH_INTERVAL } from "./config"

type TaskStatus = 'success' | 'processing' | 'failed' | 'pending'

type Task = {
  id: string
  name: string
  description: string
  status: TaskStatus
  executionTime: string
  // duration: string
}

export default function TaskPool() {
  const [tasks, setTasks] = useState<Task[]>([])

  // 状态类型映射
  const mapTaskStatus = (status: string): TaskStatus => {
    const statusMap: Record<string, TaskStatus> = {
      'completed': 'success',
      'running': 'processing',
      'failed': 'failed',
      'pending': 'pending'
    }
    return statusMap[status.toLowerCase()] || 'pending'
  }

  // 数据获取逻辑
  useEffect(() => {
    const refresh = async () => {
      try {
        const data = await getTasks()
        if (!data) return

        const mappedTasks = data.map(item => ({
          id: item.id,
          name: item.type,
          description: item.description,
          status: mapTaskStatus(item.status),
          executionTime: item.timestamp?.toISOString(),
          // duration: '--' // 持续时间需要根据实际数据调整
        }))

        setTasks(mappedTasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    refresh()
    const interval = setInterval(refresh, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (executionTime: string): string => {
    return new Date(executionTime).toLocaleTimeString();
  };

  const statusConfig = {
    success: { 
      color: 'bg-green-400',
      icon: <CheckCircle2 className="text-green-500" />
    },
    processing: { 
      color: 'bg-yellow-400',
      icon: <Loader2 className="animate-spin text-yellow-500" />
    },
    failed: { 
      color: 'bg-red-400',
      icon: <AlertCircle className="text-red-500" />
    },
    pending: { 
      color: 'bg-gray-400',
      icon: <Clock className="text-gray-500" />
    }
  }

  const formatTime = (time: string) => {
    if (time === '--') return time
    try {
      const date = new Date(time)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch {
      return '--'
    }
  }

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Task Pool</h2>
      </div>

      <div className="space-y-2 max-h-[28rem] overflow-y-auto">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-800 transition-colors"
          >
            {/* 头部：图标+名称+时间 */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {React.cloneElement(statusConfig[task.status].icon, {
                  className: `${statusConfig[task.status].icon.props.className} w-4 h-4`
                })}

                <h3 className="font-medium text-xs md:text-sm">{task.name}</h3>

              </div>
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(task.executionTime)}
              </span>
            </div>

            {/* 描述 */}
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
              {task.description}
            </p>

            {/* 状态指示 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusConfig[task.status].color}`} />
                <span className="text-xs capitalize text-gray-600">
                  {task.status}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {/* {task.duration} */}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
