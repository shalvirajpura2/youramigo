'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import AmigoOrb from '@/components/ui/AmigoOrb'

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
  const [isFocused, setIsFocused] = useState(false)

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
        className="px-8 lg:px-16 py-4"
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'var(--text)' }}>your amigo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/missions" style={{ color: 'var(--text-2)', fontSize: 12 }} className="hover:text-white transition-colors">
              start mission
            </Link>
            <Link href="/dashboard" style={{ color: 'var(--text-2)', fontSize: 12 }} className="hover:text-white transition-colors">
              dashboard
            </Link>
          </div>
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
        className="flex-1 flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 py-28 gap-12"
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
                border: isFocused ? '1px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: isFocused ? '0 0 16px rgba(46, 99, 165, 0.18)' : 'none',
                borderRadius: 8,
                background: 'var(--card)',
                overflow: 'hidden',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="describe a mission for your amigo..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 20px',
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
                  padding: '0 24px',
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
          <div style={{ marginBottom: 36 }}>
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
    </div>
  )
}
