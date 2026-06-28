'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

export default function WirePage() {
  const { settings, updateSettings } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testKey = async () => {
    if (!settings.wireApiKey) {
      setTestResult('please enter an api key first')
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('https://api.anakin.io/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': settings.wireApiKey,
        },
        body: JSON.stringify({ prompt: 'test', limit: 1 }),
      })
      if (res.ok) {
        setTestResult('connection valid: key is active')
      } else {
        const data = await res.json().catch(() => ({}))
        setTestResult(`invalid key: returned status ${res.status}${data.message ? ` (${data.message})` : ''}`)
      }
    } catch (e) {
      setTestResult('connection failed: network error')
    } finally {
      setTesting(false)
    }
  }

  const PROVIDERS = [
    { id: 'reddit', name: 'reddit', desc: 'discussions, pain points, communities', status: 'available' },
    { id: 'github', name: 'github', desc: 'repos, issues, developer sentiment', status: 'available' },
    { id: 'linkedin', name: 'linkedin', desc: 'company data, professional profiles', status: 'available' },
    { id: 'producthunt', name: 'product hunt', desc: 'launches, reviews, upvotes', status: 'available' },
    { id: 'hackernews', name: 'hacker news', desc: 'tech discussions, startup feedback', status: 'available' },
    { id: 'company-sites', name: 'company websites', desc: 'about pages, blog posts', status: 'available' },
    { id: 'news', name: 'news', desc: 'press, announcements, industry news', status: 'available' },
    { id: 'pricing', name: 'pricing pages', desc: 'competitor pricing extraction', status: 'available' },
    { id: 'reviews', name: 'reviews', desc: 'g2, capterra, app store', status: 'available' },
    { id: 'docs', name: 'documentation', desc: 'api docs, changelog, specs', status: 'available' },
  ]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          wire
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          anakin wire
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          the primary integration layer. all external data flows through wire.
        </p>
      </div>

      {/* api key */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--card)',
          padding: '20px 24px',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>api key</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 16 }}>
          get your key at{' '}
          <a href="https://anakin.io" target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
            anakin.io
          </a>
        </div>
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <input
            type={showKey ? 'text' : 'password'}
            value={settings.wireApiKey}
            onChange={(e) => updateSettings({ wireApiKey: e.target.value })}
            placeholder="ak_..."
            className="mono"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '10px 14px',
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              background: 'transparent',
              border: 'none',
              borderLeft: '1px solid var(--border)',
              padding: '0 14px',
              color: 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={save}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              background: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            <Save size={11} />
            {saved ? 'saved' : 'save key'}
          </button>
          <button
            onClick={testKey}
            disabled={testing}
            style={{
              padding: '7px 16px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'inherit',
            }}
            className="hover:bg-[var(--hover)] hover:text-white"
          >
            {testing ? 'testing...' : 'test connection'}
          </button>
        </div>
        {testResult && (
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: testResult.startsWith('connection valid') ? 'var(--success)' : 'var(--error)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {testResult}
          </div>
        )}
      </div>

      {/* providers */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          available providers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.desc}</div>
              </div>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  color: 'var(--text-3)',
                }}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
