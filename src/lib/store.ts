import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Mission, WorkerRun, WireRequest, MemoryEntry,
  AppSettings, VoiceTranscript,
} from './types'

interface AmigoStore {
  // settings
  settings: AppSettings
  updateSettings: (s: Partial<AppSettings>) => void

  // missions
  missions: Mission[]
  activeMissionId: string | null
  addMission: (m: Mission) => void
  updateMission: (id: string, patch: Partial<Mission>) => void
  setActiveMission: (id: string | null) => void

  // wire requests
  wireRequests: WireRequest[]
  addWireRequest: (r: WireRequest) => void
  updateWireRequest: (id: string, patch: Partial<WireRequest>) => void

  // memory
  memory: MemoryEntry[]
  addMemory: (e: MemoryEntry) => void
  clearMemory: () => void

  // terminal logs
  terminalLogs: string[]
  appendLog: (line: string) => void
  clearLogs: () => void

  // voice
  transcripts: VoiceTranscript[]
  addTranscript: (t: VoiceTranscript) => void

  // live mode
  liveMode: boolean
  toggleLiveMode: () => void

  // command palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void

  // sidebar collapsed
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // free trial
  freeMissionsUsed: number
  incrementFreeMissionsUsed: () => void

  // onboarding tour
  isTourActive: boolean
  tourStep: number
  setTourActive: (active: boolean) => void
  setTourStep: (step: number) => void
}

export const useStore = create<AmigoStore>()(
  persist(
    (set) => ({
      freeMissionsUsed: 0,
      incrementFreeMissionsUsed: () =>
        set((state) => ({ freeMissionsUsed: state.freeMissionsUsed + 1 })),
      settings: {
        wireApiKey: '',
        llmModel: 'gpt-4o',
        voiceProvider: 'web-speech',
        liveMode: false,
        memoryRetentionDays: 30,
      },
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      missions: [],
      activeMissionId: null,
      addMission: (m) => set((state) => ({ missions: [m, ...state.missions] })),
      updateMission: (id, patch) =>
        set((state) => ({
          missions: state.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      setActiveMission: (id) => set({ activeMissionId: id }),

      wireRequests: [],
      addWireRequest: (r) =>
        set((state) => ({ wireRequests: [r, ...state.wireRequests].slice(0, 500) })),
      updateWireRequest: (id, patch) =>
        set((state) => ({
          wireRequests: state.wireRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      memory: [],
      addMemory: (e) =>
        set((state) => ({ memory: [e, ...state.memory].slice(0, 1000) })),
      clearMemory: () => set({ memory: [] }),

      terminalLogs: [],
      appendLog: (line) =>
        set((state) => ({
          terminalLogs: [...state.terminalLogs, line].slice(-200),
        })),
      clearLogs: () => set({ terminalLogs: [] }),

      transcripts: [],
      addTranscript: (t) =>
        set((state) => ({ transcripts: [t, ...state.transcripts] })),

      liveMode: false,
      toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      isTourActive: false,
      tourStep: 0,
      setTourActive: (active) => set({ isTourActive: active, tourStep: 0 }),
      setTourStep: (step) => set({ tourStep: step }),
    }),
    {
      name: 'amigo-store',
      partialize: (state) => ({
        settings: state.settings,
        missions: state.missions,
        memory: state.memory,
        wireRequests: state.wireRequests,
        terminalLogs: state.terminalLogs,
        transcripts: state.transcripts,
        liveMode: state.liveMode,
        sidebarCollapsed: state.sidebarCollapsed,
        freeMissionsUsed: state.freeMissionsUsed,
      }),
    }
  )
)
