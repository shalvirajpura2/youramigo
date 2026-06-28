'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight } from 'lucide-react'

const TERMINAL_LINES = [
  { delay: 0, text: '> mission started: validate healthcare startup idea', type: 'highlight' },
  { delay: 800, text: 'planner decomposing mission into tasks...', type: 'info' },
  { delay: 1600, text: 'market intelligence worker spawned', type: 'success' },
  { delay: 2100, text: 'customer discovery worker spawned', type: 'success' },
  { delay: 2600, text: 'competitive research worker spawned', type: 'success' },
  { delay: 3200, text: 'wire → reddit.com/r/dentistry (searching pain points)', type: 'wire' },
  { delay: 3900, text: 'wire ← ok 312ms 847 discussions found', type: 'wire' },
  { delay: 4500, text: 'finding: 127 dentists complained about insurance paperwork', type: 'success' },
  { delay: 5100, text: 'wire → hackernews (searching: healthcare saas)', type: 'wire' },
  { delay: 5700, text: 'wire ← ok 189ms 23 relevant threads', type: 'wire' },
  { delay: 6300, text: 'wire → linkedin.com (researching dental office managers)', type: 'wire' },
  { delay: 6900, text: 'memory updated: key pain point identified', type: 'info' },
  { delay: 7500, text: 'competitive research: 4 competitors found', type: 'info' },
  { delay: 8100, text: 'wire → dentrix.com/pricing (extracting pricing data)', type: 'wire' },
  { delay: 8700, text: 'confidence: 87% — strong signal detected', type: 'highlight' },
  { delay: 9300, text: 'recommended next action: interview 10 clinic owners', type: 'success' },
  { delay: 9900, text: 'report generated. mission complete.', type: 'success' },
]

const MISSION_TEMPLATES = [
  'validate startup idea',
  'find first customers',
  'prepare yc application',
  'launch product',
  'research competitors',
  'monitor market',
]

export default function LandingPage() {
  const router = useRouter()
  const [visibleLines, setVisibleLines] = useState<typeof TERMINAL_LINES>([])
  const [input, setInput] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    TERMINAL_LINES.forEach((line) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line])
      }, line.delay)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [visibleLines])

  const handleStart = () => {
    router.push('/missions')
  }

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowY: 'auto' }}
      className="flex flex-col"
    >
      {/* top bar */}
      <nav
        style={{ borderBottom: '1px solid var(--border)' }}
        className="flex items-center justify-between px-8 py-4"
      >
        <span className="mono text-sm" style={{ color: 'var(--text)' }}>your amigo</span>
        <div className="flex items-center gap-6">
          <Link href="/missions" style={{ color: 'var(--text-2)', fontSize: 12 }} className="hover:text-white transition-colors">
            start mission
          </Link>
          <Link href="/dashboard" style={{ color: 'var(--text-2)', fontSize: 12 }} className="hover:text-white transition-colors">
            dashboard
          </Link>
        </div>
      </nav>

      {/* hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
          style={{ maxWidth: 560 }}
        >
          <p className="mono mb-6" style={{ color: 'var(--text-2)', fontSize: 12, letterSpacing: '0.08em' }}>
            your amigo / v1.0
          </p>
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: 24,
            }}
          >
            your startup kept
            <br />
            moving while you slept.
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            assign missions. autonomous workers research, reason and execute
            through anakin wire — delivering evidence-backed decisions while you build.
          </p>

          {/* mission input */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                overflow: 'hidden',
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="describe a mission for your amigo..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <button
                onClick={handleStart}
                style={{
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '0 20px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                start <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* mission templates */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {MISSION_TEMPLATES.map((t) => (
              <button
                key={t}
                onClick={() => { setInput(t); router.push('/missions') }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--text-2)',
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  fontFamily: 'Inter, sans-serif',
                }}
                className="hover:bg-[var(--hover)] hover:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* terminal demo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            width: '100%',
            maxWidth: 680,
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--card)',
            overflow: 'hidden',
          }}
        >
          {/* terminal header */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <span className="mono" style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-3)' }}>
              live execution log
            </span>
          </div>

          {/* terminal body */}
          <div
            ref={terminalRef}
            style={{ padding: '16px', height: 280, overflowY: 'auto' }}
            className="scroll-y"
          >
            <AnimatePresence>
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`terminal-line ${line.type}`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {visibleLines.length > 0 && (
              <span className="terminal-line animate-blink">_</span>
            )}
          </div>
        </motion.div>

        {/* mission status card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
          style={{
            marginTop: 24,
            width: '100%',
            maxWidth: 680,
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--card)',
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>mission</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>validate healthcare startup idea</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>running</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'planner', status: 'complete' },
              { label: 'market intelligence', status: 'running' },
              { label: 'competitive research', status: 'running' },
              { label: 'pricing intelligence', status: 'waiting' },
            ].map((w) => (
              <div key={w.label}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{w.label}</div>
                <div style={{ fontSize: 11, color: w.status === 'running' ? 'var(--text)' : w.status === 'complete' ? 'var(--text-2)' : 'var(--text-3)' }}>
                  {w.status}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>wire</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>281 requests</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>confidence</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>87%</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>recommended action</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>interview 10 clinic owners</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* features strip */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '40px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, maxWidth: 900, margin: '0 auto' }}>
          {[
            { title: 'mission-based', desc: 'assign missions in plain language. amigo handles everything else.' },
            { title: 'anakin wire', desc: 'every insight comes from real web data through wire — not simulated.' },
            { title: 'persistent memory', desc: 'workers remember everything. missions run continuously, even when you sleep.' },
            { title: 'wire explorer', desc: 'see every wire request in real time. full observability into the data pipeline.' },
          ].map((f) => (
            <div key={f.title}>
              <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8, fontWeight: 500 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
