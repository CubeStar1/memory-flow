export interface SystemMemory {
  // Core Memory
  total: number
  free: number
  available: number
  buffers: number
  cached: number
  
  // Swap Memory
  swapTotal: number
  swapFree: number
  swapCached: number
  
  // Memory States
  active: number
  inactive: number
  dirty: number
  mapped: number
  
  // Anonymous Memory
  anonPages: number
  activeAnon: number
  inactiveAnon: number
  
  // File Memory
  activeFile: number
  inactiveFile: number
  
  // Other Memory
  slab: number
  kernelStack: number
  pageTables: number
  committed: number
  vmallocUsed: number
}

export interface ProcessMemoryEntry {
  address: string
  kbytes: number
  rss: number
  dirty: number
  mode: string
  mapping: string
}

export interface ProcessMemory {
  pid: number
  command: string
  entries: ProcessMemoryEntry[]
  totals: {
    kbytes: number
    rss: number
    dirty: number
  }
}

export interface MemoryMapping {
  address: string
  perms: string
  offset: string
  dev: string
  inode: string
  pathname: string
}

export interface MemoryData {
  systemMemory: SystemMemory
  processMemory: ProcessMemory
  memoryMappings: MemoryMapping[]
} 