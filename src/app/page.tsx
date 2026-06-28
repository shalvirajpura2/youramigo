'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

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
  const [input, setInput] = useState('')

  const handleStart = () => {
    router.push('/missions')
  }

  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowY: 'auto' }}
      className="flex flex-col grid-bg"
    >
      <div className="spotlight" />
      {/* top bar */}
      <nav
        style={{ borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}
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
      {/* Faded background hero artwork on the right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backgroundImage: 'url(/amigo-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.16,
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'linear-gradient(to left, black 20%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to left, black 20%, transparent 90%)',
        }}
      />

      {/* hero dual-column container */}
      <div 
        className="flex-1 flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 py-16 gap-12" 
        style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}
      >
        {/* Left Column: Headline, Input & Templates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start text-left"
          style={{ flex: 1, maxWidth: 520 }}
        >
          {/* Version Pill */}
          <div
            style={{
              padding: '4px 10px',
              border: '1px solid var(--border)',
              borderRadius: 20,
              background: 'var(--card)',
              fontSize: 10,
              color: 'var(--text-2)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} className="animate-pulse-dot" />
            <span className="mono">your amigo / v1.0</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(38px, 4.5vw, 54px)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: 24,
            }}
          >
            your startup kept
            <br />
            moving <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--text)' }}>while you slept.</span>
          </h1>
          
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 36 }}>
            assign missions. autonomous workers research, reason and execute
            through anakin wire — delivering evidence-backed decisions while you build.
          </p>

          {/* mission input */}
          <div style={{ marginBottom: 20, width: '100%' }}>
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                overflow: 'hidden',
                width: '100%',
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
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              suggested templates
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
          </div>
        </motion.div>
      </div>


      {/* features strip */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '40px 48px', position: 'relative', zIndex: 1 }}>
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
