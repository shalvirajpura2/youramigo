'use client'

import { use, useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimestamp, formatRelative } from '@/lib/utils'
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import { runMission } from '@/services/missionRunner'

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { missions, wireRequests } = useStore()
  const router = useRouter()
  const [replayIndex, setReplayIndex] = useState<number | null>(null)
  const [isReplaying, setIsReplaying] = useState(false)
  const [tab, setTab] = useState<'timeline' | 'replay' | 'report'>('timeline')

  const mission = missions.find((m) => m.id === id)
  const missionWire = wireRequests.filter((r) => r.missionId === id)

  useEffect(() => {
    if (mission && mission.status === 'planning') {
      runMission(mission.id)
    }
  }, [mission])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isReplaying && mission?.timeline) {
      const max = mission.timeline.length - 1
      if (replayIndex === null) setReplayIndex(0)
      else if (replayIndex < max) {
        timer = setTimeout(() => setReplayIndex((i) => (i ?? 0) + 1), 600)
      } else {
        setIsReplaying(false)
      }
    }
    return () => clearTimeout(timer)
  }, [isReplaying, replayIndex, mission])

  if (!mission) {
    return (
      <div style={{ padding: '48px 40px' }}>
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>mission not found</p>
      </div>
    )
  }

  const displayedEvents = replayIndex !== null
    ? mission.timeline.slice(0, replayIndex + 1)
    : mission.timeline

  const startReplay = () => {
    setReplayIndex(0)
    setIsReplaying(true)
    setTab('replay')
  }

  const TABS = ['timeline', 'replay', 'report'] as const

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>
      {/* back */}
      <button
        onClick={() => router.push('/missions')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          marginBottom: 24,
          padding: 0,
          fontFamily: 'inherit',
        }}
        className="hover:text-white"
      >
        <ArrowLeft size={11} /> missions
      </button>

      {/* mission header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              mission
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {mission.title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mission.status === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
                <span style={{ fontSize: 11, color: 'var(--text-2)' }}>running</span>
              </div>
            )}
            {(mission.status === 'planning' || mission.status === 'idle' || mission.status === 'paused') && (
              <button
                onClick={() => runMission(mission.id)}
                style={{
                  padding: '5px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                start mission
              </button>
            )}
            {mission.status === 'completed' && (
              <button
                onClick={() => {
                  // Reset mission to planning
                  useStore.getState().updateMission(mission.id, {
                    status: 'planning',
                    confidence: 0,
                    report: undefined,
                    workers: mission.workers.map(w => ({ ...w, status: 'idle', wireRequests: 0, findings: 0 }))
                  })
                }}
                style={{
                  padding: '5px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'inherit',
                }}
                className="hover:bg-[var(--hover)] hover:text-white"
              >
                rerun mission
              </button>
            )}
          </div>
        </div>

        {/* stats row */}
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>wire requests</div>
            <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{missionWire.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>workers</div>
            <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{mission.workers.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>findings</div>
            <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{mission.findings.length}</div>
          </div>
          {mission.confidence > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>confidence</div>
              <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{mission.confidence}%</div>
            </div>
          )}
        </div>
      </div>

      {/* worker status */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--card)',
          padding: '16px 20px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {mission.workers.map((w) => (
            <div key={w.workerId}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{w.workerId.replace(/-/g, ' ')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {w.status === 'running' && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
                )}
                <span style={{
                  fontSize: 11,
                  color: w.status === 'running' ? 'var(--text)' : w.status === 'complete' ? 'var(--text-2)' : 'var(--text-3)',
                }}>
                  {w.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'replay') startReplay() }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '1px solid var(--text)' : '1px solid transparent',
              padding: '8px 16px',
              color: tab === t ? 'var(--text)' : 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'inherit',
              marginBottom: -1,
              transition: 'color 0.1s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* timeline / replay */}
      {(tab === 'timeline' || tab === 'replay') && (
        <div>
          {tab === 'replay' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button
                onClick={() => { setReplayIndex(0); setIsReplaying(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  border: '1px solid var(--border)', borderRadius: 6, background: 'transparent',
                  color: 'var(--text-2)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                }}
                className="hover:bg-[var(--hover)] hover:text-white"
              >
                <RotateCcw size={11} /> restart
              </button>
              <button
                onClick={() => setIsReplaying(!isReplaying)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  border: '1px solid var(--border)', borderRadius: 6, background: 'transparent',
                  color: 'var(--text-2)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                }}
                className="hover:bg-[var(--hover)] hover:text-white"
              >
                {isReplaying ? <><Pause size={11} /> pause</> : <><Play size={11} /> play</>}
              </button>
              {replayIndex !== null && mission.timeline.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {replayIndex + 1} / {mission.timeline.length}
                </span>
              )}
              {/* scrubber */}
              <input
                type="range"
                min={0}
                max={mission.timeline.length - 1}
                value={replayIndex ?? 0}
                onChange={(e) => { setIsReplaying(false); setReplayIndex(Number(e.target.value)) }}
                style={{ flex: 1, accentColor: 'var(--text)' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <AnimatePresence>
              {displayedEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', gap: 14, marginBottom: 18, position: 'relative' }}
                >
                  {i < displayedEvents.length - 1 && (
                    <div style={{ position: 'absolute', left: 5, top: 14, bottom: -18, width: 1, background: 'var(--border)' }} />
                  )}
                  <div style={{
                    width: 11, height: 11, borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: event.type === 'finding' ? 'var(--text-2)' : event.type === 'wire_request' ? 'var(--hover)' : 'var(--bg)',
                    flexShrink: 0, marginTop: 2,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>
                      {formatTimestamp(event.timestamp)} · <span style={{ color: 'var(--text-2)' }}>{event.workerName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 400 }}>{event.title}</div>
                    {event.body && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.6 }}>{event.body}</div>}
                    {event.confidence && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>confidence</span>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--text-2)' }}>{event.confidence}%</span>
                        </div>
                        <div className="confidence-bar" style={{ width: 120 }}>
                          <div className="confidence-fill" style={{ width: `${event.confidence}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {displayedEvents.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>no events yet</p>
            )}
          </div>
        </div>
      )}

      {/* report tab */}
      {tab === 'report' && (
        <div>
          {mission.report ? (
            <ReportView report={mission.report} />
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>report will be generated when the mission completes</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReportView({ report }: { report: NonNullable<import('@/lib/types').Mission['report']> }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>confidence</div>
            <div className="mono" style={{ fontSize: 20, color: 'var(--text)', fontWeight: 300 }}>{report.confidence}%</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>sources</div>
            <div className="mono" style={{ fontSize: 20, color: 'var(--text)', fontWeight: 300 }}>{report.sources}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>workers</div>
            <div className="mono" style={{ fontSize: 20, color: 'var(--text)', fontWeight: 300 }}>{report.workers}</div>
          </div>
        </div>
        <div
          style={{
            padding: '14px 16px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--card)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>executive summary</div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{report.executiveSummary}</p>
        </div>
        <div
          style={{
            padding: '14px 16px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--hover)',
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>recommended next action</div>
          <p style={{ fontSize: 12, color: 'var(--text)' }}>{report.recommendedNextAction}</p>
        </div>
      </div>
      {report.sections.map((s) => (
        <div key={s.id} style={{ marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>{s.title}</div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>{s.content}</p>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-3)' }}>confidence {s.confidence}%</div>
        </div>
      ))}
    </div>
  )
}
