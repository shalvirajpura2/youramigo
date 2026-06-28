// Core domain types for your amigo

export type MissionStatus = 'idle' | 'planning' | 'running' | 'paused' | 'completed' | 'failed'
export type WorkerStatus = 'idle' | 'running' | 'waiting' | 'complete' | 'error'
export type WireRequestStatus = 'pending' | 'success' | 'cached' | 'error' | 'retrying'

export interface Mission {
  id: string
  title: string
  description: string
  status: MissionStatus
  template?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  workers: WorkerRun[]
  wireRequests: number
  confidence: number
  findings: Finding[]
  timeline: TimelineEvent[]
  report?: Report
}

export interface WorkerDefinition {
  id: string
  name: string
  role: string
  description: string
  capabilities: string[]
  sources: string[]
  icon: string
}

export interface WorkerRun {
  workerId: string
  missionId: string
  status: WorkerStatus
  currentTask?: string
  startedAt?: string
  completedAt?: string
  wireRequests: number
  findings: number
  memory: MemoryEntry[]
}

export interface Finding {
  id: string
  workerId: string
  missionId: string
  content: string
  source: string
  sourceUrl?: string
  confidence: number
  evidence: number
  timestamp: string
  tags: string[]
}

export interface TimelineEvent {
  id: string
  timestamp: string
  workerId: string
  workerName: string
  type: 'started' | 'wire_request' | 'finding' | 'memory_update' | 'completed' | 'error' | 'reasoning'
  title: string
  body?: string
  confidence?: number
  wireService?: string
  metadata?: Record<string, unknown>
}

export interface WireRequest {
  id: string
  missionId: string
  workerId: string
  workerName: string
  service: string
  endpoint: string
  url?: string
  query?: string
  status: WireRequestStatus
  latencyMs: number
  responseSize?: number
  cached: boolean
  retryCount: number
  requestedAt: string
  completedAt?: string
  response?: unknown
  usedFor?: string
  missionInfluence?: string
  confidence?: number
}

export interface MemoryEntry {
  id: string
  missionId?: string
  key: string
  value: string
  source: string
  confidence: number
  timestamp: string
  tags: string[]
}

export interface MemoryNode {
  id: string
  label: string
  type: 'mission' | 'topic' | 'entity' | 'finding' | 'source'
  confidence: number
  connections: string[]
}

export interface Report {
  id: string
  missionId: string
  title: string
  generatedAt: string
  executiveSummary: string
  sections: ReportSection[]
  confidence: number
  sources: number
  workers: number
  recommendedNextAction: string
}

export interface ReportSection {
  id: string
  title: string
  content: string
  confidence: number
  evidence: string[]
  findings: Finding[]
}

export interface MissionTemplate {
  id: string
  title: string
  description: string
  workers: string[]
  estimatedDuration: string
  category: string
}

export interface VoiceTranscript {
  id: string
  timestamp: string
  input: string
  missionCreated?: string
  confidence: number
}

export interface AppSettings {
  wireApiKey: string
  llmModel: string
  voiceProvider: string
  liveMode: boolean
  memoryRetentionDays: number
}
