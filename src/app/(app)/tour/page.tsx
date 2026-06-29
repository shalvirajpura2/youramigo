'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Sparkles, Play, Search, Shield, Cpu, HelpCircle, ArrowRight } from 'lucide-react'

export default function TourPage() {
  const { setTourActive } = useStore()
  const router = useRouter()

  const handleStartTour = () => {
    setTourActive(true)
    router.push('/dashboard')
  }

  const features = [
    {
      icon: <Cpu className="text-amber-500" size={20} />,
      title: 'Autonomous Workers',
      desc: 'Amigo decomposes your mission prompt into specialized tasks executed by distinct workers (Market, Customer, Competition, Pricing, Risks) in parallel.',
    },
    {
      icon: <Search className="text-amber-500" size={20} />,
      title: 'Anakin Wire Telemetry',
      desc: 'Real-time outbound scraping and community search indexing are channeled through our proxy API. You get 2 free trial runs before needing to enter your own key (BYOK).',
    },
    {
      icon: <Shield className="text-amber-500" size={20} />,
      title: 'Decentralized Memory',
      desc: 'Every key fact, pricing tier, and competitor link scraped during a mission is logged as a distinct memory entry, accessible and queryable inside the Memory explorer.',
    },
  ]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 840, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
          <Sparkles size={12} style={{ color: 'rgb(245, 158, 11)' }} />
          <span style={{ fontSize: 11, color: 'rgb(245, 158, 11)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Onboarding Hub
          </span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>
          Welcome to Your Amigo
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          An autonomous startup research agent that decomposes your prompt, crawls the web for real-time market signals, and delivers syntheses.
        </p>
      </div>

      {/* Main Tour Trigger Card */}
      <div
        style={{
          background: 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.06), transparent), rgba(25, 25, 25, 0.3)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: 12, borderRadius: '50%' }}>
          <Play size={24} style={{ color: 'rgb(245, 158, 11)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
            Guided Interface Tour
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Launch a step-by-step interactive walkthrough to understand the dashboard, sidebar layout, logs telemetry, and wire settings.
          </p>
        </div>
        <button
          onClick={handleStartTour}
          style={{
            background: 'rgb(245, 158, 11)',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
            marginTop: 8,
          }}
        >
          Start Guided Tour <ArrowRight size={16} />
        </button>
      </div>

      {/* Features Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(25, 25, 25, 0.25)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Guide Checklist */}
      <div style={{ background: 'rgba(25, 25, 25, 0.2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 16, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <HelpCircle size={16} style={{ color: 'var(--text-3)' }} />
          Amigo Cheat Sheet
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
          <li>
            <strong>Launching Missions:</strong> Go to <em>Missions</em>, enter a startup idea like "Validate AI translation app", and click Start. The agents will take care of the rest.
          </li>
          <li>
            <strong>Wire Proxy:</strong> Outbound requests go through our serverless proxy. Add your own <em>ANAKIN_KEY</em> in settings to secure unlimited API queries.
          </li>
          <li>
            <strong>Command Palette:</strong> Hit <code>Ctrl+K</code> or <code>Cmd+K</code> to jump anywhere without clicking.
          </li>
        </ul>
      </div>
    </div>
  )
}
