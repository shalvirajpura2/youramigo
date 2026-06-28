'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import CommandBar from '@/components/layout/CommandBar'
import ActivityPanel from '@/components/layout/ActivityPanel'
import TerminalPanel from '@/components/terminal/TerminalPanel'
import CommandPalette from '@/components/command/CommandPalette'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setCommandPaletteOpen } = useStore()

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 280px',
        gridTemplateRows: '44px 1fr 180px',
        height: '100vh',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* sidebar spans all rows */}
      <div style={{ gridRow: '1 / 4', borderRight: '1px solid var(--border)', background: 'var(--bg)' }}>
        <Sidebar />
      </div>

      {/* top command bar */}
      <div style={{ gridColumn: '2', gridRow: '1', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <CommandBar />
      </div>

      {/* main workspace */}
      <div style={{ gridColumn: '2', gridRow: '2', overflowY: 'auto' }} className="scroll-y">
        {children}
      </div>

      {/* bottom terminal */}
      <div style={{ gridColumn: '2', gridRow: '3', borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <TerminalPanel />
      </div>

      {/* right activity panel spans rows 1-3 */}
      <div style={{ gridColumn: '3', gridRow: '1 / 4', borderLeft: '1px solid var(--border)', background: 'var(--bg)' }}>
        <ActivityPanel />
      </div>

      {/* command palette overlay */}
      <CommandPalette />
    </div>
  )
}
