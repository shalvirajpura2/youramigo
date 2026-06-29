'use client'

import { useStore } from '@/lib/store'
import { formatRelative } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { missions, wireRequests, memory } = useStore()

  const activeMissions = missions.filter((m) => m.status === 'running' || m.status === 'planning')
  const completedMissions = missions.filter((m) => m.status === 'completed')
  const pendingWire = wireRequests.filter((r) => r.status === 'pending').length

  const allEvents = missions
    .flatMap((m) => m.timeline || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      {/* greeting */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toLowerCase()}
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {activeMissions.length > 0
            ? `${activeMissions.length} mission${activeMissions.length > 1 ? 's' : ''} running.`
            : 'hello builder.'}
        </h1>
        {activeMissions.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>
            no active missions. assign one and your amigo will get to work.
          </p>
        )}
      </div>

      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'active missions', value: activeMissions.length },
          { label: 'completed', value: completedMissions.length },
          { label: 'wire requests', value: wireRequests.length },
          { label: 'memory entries', value: memory.length },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--card)',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 22, color: 'var(--text)', fontWeight: 300 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* two column: active missions + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* active missions */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            active missions
          </div>
          {activeMissions.length === 0 ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '24px 16px', textAlign: 'center', background: 'var(--card)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>none running</p>
            </div>
          ) : (
            activeMissions.map((m) => (
              <div
                key={m.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--card)',
                  padding: '14px 16px',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{m.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{m.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {m.workers.length} workers · {m.wireRequests} wire
                  {m.confidence > 0 && ` · ${m.confidence}% confidence`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* recent activity */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            latest activity
          </div>
          {allEvents.length === 0 ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '24px 16px', textAlign: 'center', background: 'var(--card)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>no activity yet</p>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', overflow: 'hidden' }}>
              {allEvents.map((event, i) => (
                <div
                  key={event.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < allEvents.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>
                    {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {' · '}{event.workerName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>{event.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
