import { ProcessMemoryEntry } from "@/app/types/memory"
import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"

export function MemoryMapVisualizer({ entries }: { entries: ProcessMemoryEntry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Sort entries by address
    const sortedEntries = [...entries].sort((a, b) => 
      parseInt(a.address, 16) - parseInt(b.address, 16)
    )

    // Draw memory map
    const colors = {
      'r-x--': '#4CAF50', // Executable
      'rw---': '#2196F3', // Read-write
      'r----': '#FFC107', // Read-only
      '-----': '#9E9E9E', // No access
    }

    // Calculate total memory size
    const totalSize = entries.reduce((sum, entry) => sum + entry.kbytes, 0)
    
    // Draw segments
    let y = 0
    sortedEntries.forEach(entry => {
      const height = (entry.kbytes / totalSize) * canvasRef.current!.height
      const color = colors[entry.mode as keyof typeof colors] || '#9E9E9E'
      
      ctx.fillStyle = color
      ctx.fillRect(0, y, canvasRef.current!.width, height)
      
      // Draw labels
      ctx.fillStyle = '#000'
      ctx.font = '10px monospace'
      ctx.fillText(`${entry.address} (${entry.kbytes}KB)`, 5, y + 12)
      
      y += height
    })
  }, [entries])

  return (
    <Card className="p-4">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full border rounded"
      />
    </Card>
  )
} 