'use client'

import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Search, Command } from 'lucide-react'

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/missions': 'missions',
  '/crew': 'crew',
  '/memory': 'memory',
  '/wire': 'wire',
  '/wire-explorer': 'wire explorer',
  '/voice': 'voice',
  '/activity': 'activity',
  '/settings': 'settings',
}

export default function CommandBar() {
  const pathname = usePathname()
  const { setCommandPaletteOpen, wireRequests, liveMode } = useStore()

  const page = BREADCRUMBS[pathname] || pathname.split('/').pop() || 'home'
  const totalWire = wireRequests.length
  const pendingWire = wireRequests.filter((r) => r.status === 'pending').length

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
      }}
    >
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>your amigo</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/</span>
        <span style={{ fontSize: 11, color: 'var(--text)' }}>{page}</span>
      </div>

      {/* spacer */}
      <div style={{ flex: 1 }} />

      {/* wire indicator */}
      {totalWire > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            border: '1px solid var(--border)',
            borderRadius: 5,
            fontSize: 11,
            color: 'var(--text-2)',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: pendingWire > 0 ? 'var(--text-2)' : 'var(--text-3)',
              display: 'inline-block',
            }}
            className={pendingWire > 0 ? 'animate-pulse-dot' : ''}
          />
          <span className="mono">{totalWire} wire</span>
          {pendingWire > 0 && (
            <span style={{ color: 'var(--text-3)' }}>({pendingWire} pending)</span>
          )}
        </div>
      )}

      {/* live mode badge */}
      {liveMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            border: '1px solid var(--border)',
            borderRadius: 5,
            fontSize: 11,
            color: 'var(--text)',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text)', display: 'inline-block' }} className="animate-pulse-dot" />
          live
        </div>
      )}

      {/* command palette button */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 12px',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'transparent',
          color: 'var(--text-2)',
          cursor: 'pointer',
          fontSize: 11,
          fontFamily: 'inherit',
          transition: 'all 0.1s',
        }}
        className="hover:bg-[var(--hover)] hover:text-white"
      >
        <Search size={11} />
        <span>search</span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--text-3)',
            padding: '1px 5px',
            border: '1px solid var(--border)',
            borderRadius: 3,
          }}
        >
          ⌘K
        </span>
      </button>
    </div>
  )
}
