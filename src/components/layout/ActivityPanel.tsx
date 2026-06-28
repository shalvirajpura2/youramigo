'use client'

import { useStore } from '@/lib/store'
import { formatTimestamp, formatRelative } from '@/lib/utils'

export default function ActivityPanel() {
  const { wireRequests, missions, memory } = useStore()

  const recentWire = wireRequests.slice(0, 20)
  const activeMissions = missions.filter((m) => m.status === 'running')
  const allEvents = missions
    .flatMap((m) => m.timeline || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30)

  const wireByService = wireRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.service] = (acc[r.service] || 0) + 1
    return acc
  }, {})

  const topServices = Object.entries(wireByService)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-2)',
          fontWeight: 500,
        }}
      >
        activity
      </div>

      {/* wire stats */}
      {topServices.length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            wire requests
          </div>
          {topServices.map(([service, count]) => (
            <div key={service} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{service}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text)' }}>{count}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>total</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text)' }}>{wireRequests.length}</span>
          </div>
        </div>
      )}

      {/* timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} className="scroll-y">
        {allEvents.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>no activity yet</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>start a mission to see live updates</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {allEvents.map((event, i) => (
              <div key={event.id} style={{ display: 'flex', gap: 10, marginBottom: 14, position: 'relative' }}>
                {/* connector */}
                {i < allEvents.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 6,
                      top: 14,
                      bottom: -14,
                      width: 1,
                      background: 'var(--border)',
                    }}
                  />
                )}
                {/* dot */}
                <div
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: event.type === 'finding' ? 'var(--hover)' : 'var(--bg)',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>
                    {formatTimestamp(event.timestamp)} · {event.workerName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: event.body ? 3 : 0 }}>
                    {event.title}
                  </div>
                  {event.body && (
                    <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {event.body}
                    </div>
                  )}
                  {event.confidence && (
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                      confidence {event.confidence}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* memory count */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>memory entries</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{memory.length}</span>
        </div>
      </div>
    </div>
  )
}
