import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { MemoryMetrics, MemoryRecommendation } from "@/app/types/analytics"

function analyzeMemoryUsage(metrics: MemoryMetrics): MemoryRecommendation[] {
  const recommendations: MemoryRecommendation[] = []

  if (metrics.fragmentation > 0.7) {
    recommendations.push({
      message: "High memory fragmentation detected. Consider compacting memory or restarting the application.",
      severity: 'high',
      type: 'fragmentation'
    })
  }

  if (metrics.pressureScore > 0.8) {
    recommendations.push({
      message: "System is under memory pressure. Consider freeing up memory or adding more RAM.",
      severity: 'high',
      type: 'pressure'
    })
  }

  if (metrics.swapUsagePercent > 80) {
    recommendations.push({
      message: "High swap usage detected. This may impact system performance.",
      severity: 'medium',
      type: 'swap'
    })
  }

  return recommendations
}

interface MemoryOptimizerProps {
  metrics: MemoryMetrics
}

export function MemoryOptimizer({ metrics }: MemoryOptimizerProps) {
  const recommendations = analyzeMemoryUsage(metrics)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              {rec.severity === 'high' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : rec.severity === 'medium' ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <Info className="h-5 w-5 text-blue-500" />
              )}
              <span className="text-sm">{rec.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
} 