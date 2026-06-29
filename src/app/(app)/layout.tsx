'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import CommandBar from '@/components/layout/CommandBar'
import ActivityPanel from '@/components/layout/ActivityPanel'
import TerminalPanel from '@/components/terminal/TerminalPanel'
import CommandPalette from '@/components/command/CommandPalette'
import TourOverlay from '@/components/ui/TourOverlay'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setCommandPaletteOpen, settings, freeMissionsUsed } = useStore()

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
      <div style={{ gridColumn: '2', gridRow: '2', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="scroll-y">
        {!settings.wireApiKey && (
          <div
            style={{
              background: freeMissionsUsed >= 2 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(217, 119, 6, 0.05)',
              borderBottom: freeMissionsUsed >= 2 ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(217, 119, 6, 0.15)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: freeMissionsUsed >= 2 ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)' }} className="animate-pulse-dot" />
              <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Inter, sans-serif' }}>
                {freeMissionsUsed >= 2
                  ? 'Free trial limit reached (2 runs). Configure your own API key to continue running missions.'
                  : `Free trial active: You have ${2 - freeMissionsUsed} free run${2 - freeMissionsUsed === 1 ? '' : 's'} remaining.`}
              </span>
            </div>
            <Link
              href="/wire"
              style={{
                fontSize: 11,
                color: freeMissionsUsed >= 2 ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)',
                fontWeight: 500,
                textDecoration: 'underline',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Configure key
            </Link>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-y">
          {children}
        </div>
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
      <TourOverlay />
    </div>
  )
}
