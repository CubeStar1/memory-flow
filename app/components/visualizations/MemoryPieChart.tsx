"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TimelineData } from "@/app/types/analytics"

interface MemoryPieChartProps {
  data: TimelineData
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const COLORS = {
  used: "hsl(221.2 83.2% 53.3%)",    // blue-600
  available: "hsl(142.1 76.2% 36.3%)" // green-600
}

const chartConfig = {
  used: {
    label: "Used Memory",
    color: COLORS.used,
  },
  available: {
    label: "Available Memory",
    color: COLORS.available,
  },
} satisfies ChartConfig

export function MemoryPieChart({ data }: MemoryPieChartProps) {
  const totalMemory = data.used_memory + data.available_memory
  const pieData = [
    { 
      name: "Used Memory",
      value: data.used_memory,
      percentage: ((data.used_memory / totalMemory) * 100).toFixed(1),
    },
    { 
      name: "Available Memory",
      value: data.available_memory,
      percentage: ((data.available_memory / totalMemory) * 100).toFixed(1),
    },
  ]

  const usedPercentage = ((data.used_memory / totalMemory) * 100).toFixed(1)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base">Memory Distribution</CardTitle>
        <CardDescription className="text-xs">Current memory usage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 5, left: 0 }}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                cy={80}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={index === 0 ? COLORS.used : COLORS.available}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {data.name}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatBytes(data.value)}
                          </span>
                          <span className="text-[0.70rem] text-muted-foreground">
                            {data.percentage}% of total
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground">
                    {value} ({entry.payload.percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-sm">
          <span className="font-medium">{usedPercentage}% Used</span>
          <TrendingUp className="h-3 w-3 text-emerald-500" />
        </div>
      </CardContent>
    </Card>
  )
} 