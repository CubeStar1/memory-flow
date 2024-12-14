'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { MemoryMetrics, TimelineData } from '@/app/types/analytics'
import { MemoryHealthIndicator } from '@/app/components/monitoring/MemoryHealthIndicator'
import { MemoryTimelineChart } from '@/app/components/visualizations/MemoryTimelineChart'
import { MemoryOptimizer } from '@/app/components/analysis/MemoryOptimizer'

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()

      setMetrics(data)
      setTimelineData(prevData => [...prevData, {
        timestamp: Date.now(),
        used_memory: data.memory_usage || 0,
        available_memory: data.free_memory || 0,
        pageFaults: data.majorFaults + data.minorFaults
      }].slice(-30))

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <h2 className="text-red-800 dark:text-red-200">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Memory Analytics</h1>
        <Button 
          onClick={fetchData} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="space-y-6">
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MemoryHealthIndicator metrics={metrics} />
              <MemoryOptimizer metrics={metrics} />
            </div>
            
            <MemoryTimelineChart data={timelineData} />
          </>
        )}
      </div>
    </div>
  )
} 