'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Search, X, Target, Users, Database, Brain, Settings, Activity, Radio, Mic, HelpCircle } from 'lucide-react'

const COMMANDS = [
  { id: 'tour', label: 'take platform tour', description: 'understand how the platform works', icon: HelpCircle, action: '/tour' },
  { id: 'mission-new', label: 'new mission', description: 'start a new mission', icon: Target, action: '/missions' },
  { id: 'dashboard', label: 'go to dashboard', description: 'overview of all activity', icon: Target, action: '/dashboard' },
  { id: 'missions', label: 'go to missions', description: 'view all missions', icon: Target, action: '/missions' },
  { id: 'crew', label: 'go to crew', description: 'view all workers', icon: Users, action: '/crew' },
  { id: 'wire-explorer', label: 'open wire explorer', description: 'inspect all wire requests', icon: Radio, action: '/wire-explorer' },
  { id: 'wire', label: 'wire settings', description: 'configure wire api key', icon: Database, action: '/wire' },
  { id: 'memory', label: 'view memory', description: 'browse persistent memory', icon: Brain, action: '/memory' },
  { id: 'voice', label: 'voice interface', description: 'speak a mission', icon: Mic, action: '/voice' },
  { id: 'activity', label: 'activity timeline', description: 'full event history', icon: Activity, action: '/activity' },
  { id: 'settings', label: 'settings', description: 'configure your amigo', icon: Settings, action: '/settings' },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.includes(query.toLowerCase()) ||
      c.description.includes(query.toLowerCase())
  )

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const run = (cmd: (typeof COMMANDS)[0]) => {
    setCommandPaletteOpen(false)
    router.push(cmd.action)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setCommandPaletteOpen(false)
    if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1))
    if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0))
    if (e.key === 'Enter' && filtered[selected]) run(filtered[selected])
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100,
            }}
          />

          {/* palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 520,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
              zIndex: 101,
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{'>'}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="type a command..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            </div>

            {/* results */}
            <div style={{ maxHeight: 320, overflowY: 'auto' }} className="scroll-y">
              {filtered.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                  no commands found
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => run(cmd)}
                      onMouseEnter={() => setSelected(i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        background: i === selected ? 'var(--hover)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.08s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Icon size={13} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>{cmd.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{cmd.description}</div>
                      </div>
                      {i === selected && (
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)' }}>↵</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* footer */}
            <div
              style={{
                padding: '8px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 16,
                fontSize: 10,
                color: 'var(--text-3)',
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
