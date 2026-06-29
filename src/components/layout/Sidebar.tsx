'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import AmigoOrb from '@/components/ui/AmigoOrb'
import {
  LayoutDashboard, Target, Users, Brain, Database,
  Activity, Settings, Zap, Mic, Radio, HelpCircle
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/tour', label: 'tour', icon: HelpCircle },
  { href: '/missions', label: 'missions', icon: Target },
  { href: '/crew', label: 'crew', icon: Users },
  { href: '/memory', label: 'memory', icon: Brain },
  { href: '/wire', label: 'wire', icon: Database },
  { href: '/wire-explorer', label: 'wire explorer', icon: Radio },
  { href: '/voice', label: 'voice', icon: Mic },
  { href: '/activity', label: 'activity', icon: Activity },
  { href: '/settings', label: 'settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { liveMode, toggleLiveMode, missions } = useStore()

  const runningMissions = missions.filter((m) => m.status === 'running').length

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* logo */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/missions" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AmigoOrb size={18} />
          <span className="mono" style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
            your amigo
          </span>
        </Link>
      </div>

      {/* status strip */}
      {runningMissions > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {runningMissions} mission{runningMissions > 1 ? 's' : ''} running
          </span>
        </div>
      )}

      {/* nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }} className="scroll-y">
        <ul style={{ listStyle: 'none' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <li key={href} style={{ marginBottom: 1 }}>
                <Link
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '7px 10px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    background: active ? 'var(--hover)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-2)',
                    transition: 'all 0.1s',
                    fontSize: 12,
                  }}
                  className={active ? '' : 'hover:bg-[var(--hover)] hover:text-white'}
                >
                  <Icon size={13} style={{ flexShrink: 0, color: active ? 'var(--accent)' : 'inherit', opacity: active ? 1 : 0.7 }} />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* live mode toggle */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggleLiveMode}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: liveMode ? 'var(--hover)' : 'transparent',
            color: liveMode ? 'var(--text)' : 'var(--text-2)',
            cursor: 'pointer',
            fontSize: 11,
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: liveMode ? 'var(--text)' : 'var(--text-3)',
              display: 'inline-block',
            }}
            className={liveMode ? 'animate-pulse-dot' : ''}
          />
          <span>live mode</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)' }}>
            {liveMode ? 'on' : 'off'}
          </span>
        </button>
      </div>

      {/* star and builder links */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <a
          href="https://github.com/shalvirajpura2/youramigo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-2)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          className="hover:text-white"
        >
          <span>give it a star ★</span>
        </a>
        <a
          href="https://shalvirajpura.xyz"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          className="hover:text-white"
        >
          <span>builder:</span>
          <span style={{ color: 'var(--text-2)' }}>shalvirajpura.xyz</span>
        </a>
      </div>
    </div>
  )
}
