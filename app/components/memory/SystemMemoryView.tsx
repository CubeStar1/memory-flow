import { SystemMemory } from "@/app/types/memory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMemory } from "@/app/utils/format"

export function SystemMemoryView({ data }: { data: SystemMemory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Core Memory</CardTitle>
          <CardDescription>Primary memory metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Memory:</span>
            <span className="font-mono">{formatMemory(data.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Free Memory:</span>
            <span className="font-mono">{formatMemory(data.free)}</span>
          </div>
          <div className="flex justify-between">
            <span>Available Memory:</span>
            <span className="font-mono">{formatMemory(data.available)}</span>
          </div>
          <div className="flex justify-between">
            <span>Buffers:</span>
            <span className="font-mono">{formatMemory(data.buffers)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cached:</span>
            <span className="font-mono">{formatMemory(data.cached)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Swap Memory</CardTitle>
          <CardDescription>Virtual memory statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Swap Total:</span>
            <span className="font-mono">{formatMemory(data.swapTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Swap Free:</span>
            <span className="font-mono">{formatMemory(data.swapFree)}</span>
          </div>
          <div className="flex justify-between">
            <span>Swap Cached:</span>
            <span className="font-mono">{formatMemory(data.swapCached)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory States</CardTitle>
          <CardDescription>Active and inactive memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Active:</span>
            <span className="font-mono">{formatMemory(data.active)}</span>
          </div>
          <div className="flex justify-between">
            <span>Inactive:</span>
            <span className="font-mono">{formatMemory(data.inactive)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dirty:</span>
            <span className="font-mono">{formatMemory(data.dirty)}</span>
          </div>
          <div className="flex justify-between">
            <span>Mapped:</span>
            <span className="font-mono">{formatMemory(data.mapped)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anonymous Memory</CardTitle>
          <CardDescription>Process private memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Anonymous Pages:</span>
            <span className="font-mono">{formatMemory(data.anonPages)}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Anonymous:</span>
            <span className="font-mono">{formatMemory(data.activeAnon)}</span>
          </div>
          <div className="flex justify-between">
            <span>Inactive Anonymous:</span>
            <span className="font-mono">{formatMemory(data.inactiveAnon)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Memory</CardTitle>
          <CardDescription>File-backed memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Active File:</span>
            <span className="font-mono">{formatMemory(data.activeFile)}</span>
          </div>
          <div className="flex justify-between">
            <span>Inactive File:</span>
            <span className="font-mono">{formatMemory(data.inactiveFile)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kernel Memory</CardTitle>
          <CardDescription>System memory usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Slab:</span>
            <span className="font-mono">{formatMemory(data.slab)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kernel Stack:</span>
            <span className="font-mono">{formatMemory(data.kernelStack)}</span>
          </div>
          <div className="flex justify-between">
            <span>Page Tables:</span>
            <span className="font-mono">{formatMemory(data.pageTables)}</span>
          </div>
          <div className="flex justify-between">
            <span>VMalloc Used:</span>
            <span className="font-mono">{formatMemory(data.vmallocUsed)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 