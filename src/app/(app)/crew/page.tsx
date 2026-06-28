'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { WORKERS } from '@/services/workers'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Radar, DollarSign, ArrowUpRight, Code, FileText, ChevronDown, ChevronRight } from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size: number; style?: React.CSSProperties }>> = {
  TrendingUp, Users, Radar, DollarSign, ArrowUpRight, Code, FileText,
}

export default function CrewPage() {
  const { missions, wireRequests } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          crew
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          autonomous workers
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          each worker operates independently, calling anakin wire for real-world data.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WORKERS.map((worker, idx) => {
          const Icon = ICON_MAP[worker.icon] || FileText
          const isExpanded = expanded === worker.id
          const workerWire = wireRequests.filter((r) => r.workerId === worker.id)

          // Find most recent run across all missions
          const activeRuns = missions
            .flatMap((m) => m.workers)
            .filter((w) => w.workerId === worker.id && w.status === 'running')

          const isRunning = activeRuns.length > 0
          const currentTask = activeRuns[0]?.currentTask

          return (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : worker.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                className="hover:bg-[var(--hover)]"
              >
                <Icon size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{worker.name}</span>
                    {isRunning && (
                      <>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
                        <span style={{ fontSize: 10, color: 'var(--text-2)' }}>running</span>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                    {currentTask || worker.description}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {workerWire.length > 0 && (
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {workerWire.length} wire
                    </span>
                  )}
                  {isExpanded ? <ChevronDown size={12} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />}
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>capabilities</div>
                      {worker.capabilities.map((c) => (
                        <div key={c} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>— {c}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>wire sources</div>
                      {worker.sources.map((s) => (
                        <div key={s} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>— {s}</div>
                      ))}
                    </div>
                  </div>

                  {workerWire.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        recent wire requests
                      </div>
                      {workerWire.slice(0, 3).map((r) => (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: '1px solid var(--border)',
                            fontSize: 11,
                          }}
                        >
                          <span style={{ color: 'var(--text-2)' }}>{r.service} / {r.endpoint}</span>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <span className="mono" style={{ color: 'var(--text-3)' }}>{r.latencyMs}ms</span>
                            <span style={{ color: r.status === 'success' ? 'var(--success)' : 'var(--error)' }}>{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
