'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { formatRelative } from '@/lib/utils'

interface GraphNode {
  id: string
  label: string
  type: 'mission' | 'topic' | 'entity' | 'finding' | 'source'
  confidence: number
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
}

export default function MemoryPage() {
  const { memory, clearMemory, missions } = useStore()

  // Build a simple force-like layout for the memory graph
  const { nodes, edges } = useMemo(() => {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []

    // Mission nodes
    missions.slice(0, 5).forEach((m, i) => {
      nodes.push({
        id: m.id,
        label: m.title.slice(0, 20) + (m.title.length > 20 ? '...' : ''),
        type: 'mission',
        confidence: m.confidence,
        x: 320 + Math.cos((i / missions.length) * Math.PI * 2) * 160,
        y: 200 + Math.sin((i / missions.length) * Math.PI * 2) * 120,
      })
    })

    // Memory entry nodes
    const uniqueKeys = [...new Set(memory.slice(0, 20).map((e) => e.key))]
    uniqueKeys.forEach((key, i) => {
      const id = `mem-${key}`
      nodes.push({
        id,
        label: key.slice(0, 18),
        type: 'topic',
        confidence: memory.find((e) => e.key === key)?.confidence || 0,
        x: 80 + (i % 4) * 180,
        y: 60 + Math.floor(i / 4) * 80,
      })
      // Connect to related mission
      if (missions.length > 0) {
        edges.push({ from: missions[0].id, to: id })
      }
    })

    return { nodes, edges }
  }, [memory, missions])

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            memory
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            persistent memory
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {memory.length} entries stored. missions continue using this context.
          </p>
        </div>
        <button
          onClick={clearMemory}
          style={{
            padding: '7px 14px',
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
          clear memory
        </button>
      </div>

      {/* memory graph */}
      {nodes.length > 0 && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--bg-2)',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>memory graph</span>
          </div>
          <svg width="100%" height="320" style={{ display: 'block' }}>
            {/* edges */}
            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from)
              const to = nodes.find((n) => n.id === edge.to)
              if (!from || !to) return null
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              )
            })}

            {/* nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y}
                  r={node.type === 'mission' ? 20 : 12}
                  fill="var(--card)"
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle"
                  fill={node.type === 'mission' ? 'var(--text)' : 'var(--text-2)'}
                  fontSize={node.type === 'mission' ? 8 : 7}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* memory list */}
      {memory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>no memory entries yet</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>workers will store key findings here as missions run</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            entries
          </div>
          {memory.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                padding: '12px 16px',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{entry.key}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>confidence {entry.confidence}%</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{formatRelative(entry.timestamp)}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 6 }}>{entry.value}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      color: 'var(--text-3)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>via {entry.source}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
