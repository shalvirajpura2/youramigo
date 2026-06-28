'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { formatRelative, formatTimestamp } from '@/lib/utils'

export default function ActivityPage() {
  const { missions, wireRequests } = useStore()

  const allEvents = missions
    .flatMap((m) =>
      (m.timeline || []).map((e) => ({ ...e, missionTitle: m.title }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const grouped: Record<string, typeof allEvents> = {}
  allEvents.forEach((e) => {
    const date = new Date(e.timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(e)
  })

  const TYPE_COLORS: Record<string, string> = {
    started: 'var(--text-2)',
    wire_request: 'var(--text-3)',
    finding: 'var(--text)',
    memory_update: 'var(--text-3)',
    completed: 'var(--success)',
    error: 'var(--error)',
    reasoning: 'var(--text-2)',
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          activity
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          everything your amigo discovered
        </h1>
      </div>

      {allEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>no activity yet</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>start a mission to begin collecting discoveries</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, events]) => (
          <div key={date} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {date}
            </div>
            <div style={{ position: 'relative' }}>
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ display: 'flex', gap: 14, marginBottom: 20, position: 'relative' }}
                >
                  {i < events.length - 1 && (
                    <div style={{ position: 'absolute', left: 5, top: 14, bottom: -20, width: 1, background: 'var(--border)' }} />
                  )}
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: event.type === 'finding' ? 'var(--hover)' : 'var(--bg)',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>
                      {formatTimestamp(event.timestamp)}
                      {' · '}
                      <span style={{ color: 'var(--text-2)' }}>{event.workerName}</span>
                      {' · '}
                      <span style={{ color: 'var(--text-3)' }}>{event.missionTitle}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TYPE_COLORS[event.type] || 'var(--text)' }}>
                      {event.title}
                    </div>
                    {event.body && (
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.6 }}>
                        {event.body}
                      </div>
                    )}
                    {event.confidence && (
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                        confidence {event.confidence}%
                      </div>
                    )}
                    {event.wireService && (
                      <span
                        className="mono"
                        style={{
                          display: 'inline-block',
                          marginTop: 4,
                          fontSize: 10,
                          padding: '1px 5px',
                          border: '1px solid var(--border)',
                          borderRadius: 3,
                          color: 'var(--text-3)',
                        }}
                      >
                        wire: {event.wireService}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
