import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimelineData } from "@/app/types/analytics"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface MemoryTimelineChartProps {
  data: TimelineData[]
}

// Helper function to format bytes to human readable format
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Updated tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Used Memory
            </span>
            <span className="font-bold text-muted-foreground">
              {formatBytes(payload[0].value)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Available Memory
            </span>
            <span className="font-bold text-muted-foreground">
              {formatBytes(payload[1].value)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Page Faults
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[2].value.toFixed(2)}/s
            </span>
          </div>
        </div>
        <div className="text-[0.70rem] text-muted-foreground">
          {new Date(label).toLocaleTimeString()}
        </div>
      </div>
    )
  }
  return null
}

export function MemoryTimelineChart({ data }: MemoryTimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis 
                yAxisId="memory"
                stroke="#888888"
                fontSize={12}
                tickFormatter={formatBytes}
              />
              <YAxis 
                yAxisId="faults"
                orientation="right"
                stroke="#888888"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="memory"
                type="monotone"
                dataKey="used_memory"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.2}
                name="Used Memory"
                stackId="memory"
              />
              <Area
                yAxisId="memory"
                type="monotone"
                dataKey="available_memory"
                stroke="#16a34a"
                fill="#22c55e"
                fillOpacity={0.2}
                name="Available Memory"
                stackId="memory"
              />
              <Area
                yAxisId="faults"
                type="monotone"
                dataKey="pageFaults"
                stroke="#dc2626"
                fill="#ef4444"
                fillOpacity={0.2}
                name="Page Faults"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 