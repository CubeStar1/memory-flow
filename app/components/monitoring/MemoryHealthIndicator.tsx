import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MemoryMetrics } from "@/app/types/analytics"

interface HealthMetricProps {
  label: string
  value: number
  threshold: number
  unit?: string
}

function HealthMetric({ label, value, threshold, unit = '%' }: HealthMetricProps) {
  const percentage = (value / threshold) * 100
  const status = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success'
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={`font-medium ${
          status === 'danger' ? 'text-red-600' : 
          status === 'warning' ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {value.toFixed(2)}{unit}
        </span>
      </div>
      <Progress value={percentage} className={`
        ${status === 'danger' ? 'bg-red-200' : 
          status === 'warning' ? 'bg-yellow-200' : 
          'bg-green-200'}
      `} />
    </div>
  )
}

interface MemoryHealthIndicatorProps {
  metrics: MemoryMetrics
}

export function MemoryHealthIndicator({ metrics }: MemoryHealthIndicatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <HealthMetric 
          label="Memory Fragmentation"
          value={metrics.fragmentation * 100}
          threshold={70}
        />
        <HealthMetric 
          label="Page Fault Rate"
          value={metrics.pageFaultRate}
          threshold={100}
          unit="/s"
        />
        <HealthMetric 
          label="Memory Pressure"
          value={metrics.pressureScore * 100}
          threshold={80}
        />
        <HealthMetric 
          label="Swap Usage"
          value={metrics.swapUsagePercent}
          threshold={90}
        />
      </CardContent>
    </Card>
  )
} 