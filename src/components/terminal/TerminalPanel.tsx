'use client'

import { useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Trash2 } from 'lucide-react'

export default function TerminalPanel() {
  const { terminalLogs, clearLogs } = useStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLogs])

  const getLineType = (line: string): string => {
    if (line.startsWith('wire →') || line.startsWith('wire ←') || line.startsWith('wire ✗')) return 'wire'
    if (line.includes('error') || line.includes('✗')) return 'error'
    if (line.includes('started') || line.includes('spawned') || line.includes('complete')) return 'success'
    if (line.startsWith('confidence') || line.includes('confidence')) return 'highlight'
    return 'info'
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div
        style={{
          padding: '6px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          terminal
        </span>
        <div style={{ flex: 1 }} />
        {terminalLogs.length > 0 && (
          <button
            onClick={clearLogs}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              padding: '2px 4px',
            }}
            className="hover:text-white"
          >
            <Trash2 size={10} />
            clear
          </button>
        )}
      </div>

      {/* log area */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}
        className="scroll-y"
      >
        {terminalLogs.length === 0 ? (
          <div className="terminal-line" style={{ opacity: 0.4 }}>
            ready. start a mission to see live logs.
          </div>
        ) : (
          terminalLogs.map((line, i) => (
            <div key={i} className={`terminal-line ${getLineType(line)}`}>
              <span style={{ color: 'var(--text-3)', marginRight: 8, userSelect: 'none' }}>
                {String(i + 1).padStart(3, ' ')}
              </span>
              {line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
