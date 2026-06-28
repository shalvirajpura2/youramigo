'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { formatLatency, formatRelative, formatBytes } from '@/lib/utils'
import { ChevronDown, ChevronRight, Filter, ArrowUpRight } from 'lucide-react'

const SERVICES = ['all', 'reddit', 'github', 'linkedin', 'product hunt', 'hacker news', 'web-search', 'agentic-search']
const STATUSES = ['all', 'success', 'cached', 'pending', 'error', 'retrying']

export default function WireExplorerPage() {
  const { wireRequests } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterService, setFilterService] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterWorker, setFilterWorker] = useState('all')

  const workers = useMemo(() => {
    const w = new Set(wireRequests.map((r) => r.workerName))
    return ['all', ...Array.from(w)]
  }, [wireRequests])

  const filtered = wireRequests.filter((r) => {
    if (filterService !== 'all' && r.service !== filterService) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterWorker !== 'all' && r.workerName !== filterWorker) return false
    return true
  })

  // Stats by service
  const byService = wireRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.service] = (acc[r.service] || 0) + 1
    return acc
  }, {})

  const totalLatency = wireRequests.reduce((s, r) => s + r.latencyMs, 0)
  const avgLatency = wireRequests.length ? Math.round(totalLatency / wireRequests.length) : 0
  const cacheHits = wireRequests.filter((r) => r.cached).length
  const successRate = wireRequests.length
    ? Math.round((wireRequests.filter((r) => r.status === 'success' || r.status === 'cached').length / wireRequests.length) * 100)
    : 0

  return (
    <div style={{ padding: '32px 40px' }}>
      {/* header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          wire explorer
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          anakin wire requests
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          every external data request made by your workers — in real time.
        </p>
      </div>

      {/* top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'total requests', value: wireRequests.length.toString() },
          { label: 'cache hits', value: cacheHits.toString() },
          { label: 'avg latency', value: formatLatency(avgLatency) },
          { label: 'success rate', value: `${successRate}%` },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--card)',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 20, color: 'var(--text)', fontWeight: 300 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* by service */}
      {Object.keys(byService).length > 0 && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--card)',
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(byService)
            .sort(([, a], [, b]) => b - a)
            .map(([service, count]) => (
              <button
                key={service}
                onClick={() => setFilterService(filterService === service ? 'all' : service)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  opacity: filterService !== 'all' && filterService !== service ? 0.4 : 1,
                  transition: 'opacity 0.1s',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{service}</div>
                <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{count}</div>
              </button>
            ))}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>total</div>
            <div className="mono" style={{ fontSize: 18, color: 'var(--text)', fontWeight: 300 }}>{wireRequests.length}</div>
          </div>
        </div>
      )}

      {/* filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <FilterPill label="service" value={filterService} options={SERVICES} onChange={setFilterService} />
        <FilterPill label="status" value={filterStatus} options={STATUSES} onChange={setFilterStatus} />
        <FilterPill label="worker" value={filterWorker} options={workers} onChange={setFilterWorker} />
      </div>

      {/* request table */}
      {wireRequests.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>no wire requests yet</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            configure your wire api key in settings, then start a mission
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {/* table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 100px 140px 80px 70px 80px 1fr',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-2)',
              gap: 12,
            }}
          >
            {['worker', 'service', 'endpoint', 'latency', 'status', 'cached', 'used for'].map((h) => (
              <div key={h} style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {filtered.slice(0, 100).map((req) => (
            <div key={req.id}>
              <button
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '120px 100px 140px 80px 70px 80px 1fr',
                  padding: '10px 16px',
                  background: expanded === req.id ? 'var(--hover)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  gap: 12,
                  alignItems: 'center',
                  transition: 'background 0.08s',
                }}
                className={expanded !== req.id ? 'hover:bg-[var(--hover)]' : ''}
              >
                <span style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.workerName}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text)' }}>{req.service}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-2)' }}>{req.endpoint}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{formatLatency(req.latencyMs)}</span>
                <span style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: req.status === 'success' ? 'rgba(61,153,112,0.1)' : req.status === 'cached' ? 'rgba(90,90,90,0.2)' : req.status === 'error' ? 'rgba(192,57,43,0.1)' : 'transparent',
                  color: req.status === 'success' ? 'var(--success)' : req.status === 'cached' ? 'var(--text-2)' : req.status === 'error' ? 'var(--error)' : 'var(--text-3)',
                  border: '1px solid',
                  borderColor: req.status === 'success' ? 'rgba(61,153,112,0.3)' : req.status === 'cached' ? 'var(--border)' : req.status === 'error' ? 'rgba(192,57,43,0.3)' : 'transparent',
                }}>
                  {req.status}
                </span>
                <span style={{ fontSize: 11, color: req.cached ? 'var(--text-2)' : 'var(--text-3)' }}>
                  {req.cached ? 'yes' : 'no'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.usedFor || '—'}
                </span>
              </button>

              {/* expanded detail */}
              <AnimatePresence>
                {expanded === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      background: 'var(--bg-2)',
                      borderBottom: '1px solid var(--border)',
                      padding: '16px 20px',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>request</div>
                        {req.url && <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', wordBreak: 'break-all' }}>{req.url}</div>}
                        {req.query && <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)' }}>"{req.query}"</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>mission influence</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{req.missionInfluence || 'contributed to analysis'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>response size</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                          {req.responseSize ? formatBytes(req.responseSize) : '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>retry count: {req.retryCount}</div>
                      </div>
                    </div>

                    {/* flow diagram */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        req.workerName || 'worker',
                        '→ wire request →',
                        req.service,
                        '→ response →',
                        'memory',
                        '→ reasoning →',
                        'mission',
                      ].map((step, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 10,
                            color: step.startsWith('→') ? 'var(--text-3)' : 'var(--text-2)',
                            fontFamily: step.startsWith('→') ? 'inherit' : 'JetBrains Mono, monospace',
                            padding: step.startsWith('→') ? '0' : '2px 6px',
                            border: step.startsWith('→') ? 'none' : '1px solid var(--border)',
                            borderRadius: 4,
                            background: step.startsWith('→') ? 'transparent' : 'var(--card)',
                          }}
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <span style={{ fontSize: 10, color: 'var(--text-3)', marginRight: 6 }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 5,
          color: 'var(--text-2)',
          padding: '4px 8px',
          fontSize: 11,
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
