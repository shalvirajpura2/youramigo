'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Save } from 'lucide-react'

const LLM_MODELS = [
  { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'claude 3.5 sonnet', provider: 'anthropic' },
  { id: 'gemini-pro', name: 'gemini pro', provider: 'google' },
  { id: 'llama-3', name: 'llama 3', provider: 'meta' },
]

const VOICE_PROVIDERS = [
  { id: 'web-speech', name: 'web speech api', desc: 'built-in browser api, no extra setup' },
  { id: 'elevenlabs', name: 'elevenlabs', desc: 'high quality tts streaming' },
  { id: 'openai-tts', name: 'openai tts', desc: 'openai text to speech' },
]

export default function SettingsPage() {
  const { settings, updateSettings, clearMemory } = useStore()
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          settings
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          configuration
        </h1>
      </div>

      <SettingSection title="llm model">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LLM_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => updateSettings({ llmModel: m.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                border: `1px solid ${settings.llmModel === m.id ? 'var(--text-2)' : 'var(--border)'}`,
                borderRadius: 7,
                background: settings.llmModel === m.id ? 'var(--hover)' : 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.1s',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  border: `1px solid ${settings.llmModel === m.id ? 'var(--text)' : 'var(--border)'}`,
                  background: settings.llmModel === m.id ? 'var(--text)' : 'transparent',
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: settings.llmModel === m.id ? 500 : 400 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.provider}</div>
              </div>
            </button>
          ))}
        </div>
      </SettingSection>

      <SettingSection title="voice provider">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {VOICE_PROVIDERS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateSettings({ voiceProvider: v.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                border: `1px solid ${settings.voiceProvider === v.id ? 'var(--text-2)' : 'var(--border)'}`,
                borderRadius: 7,
                background: settings.voiceProvider === v.id ? 'var(--hover)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.1s',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  border: `1px solid ${settings.voiceProvider === v.id ? 'var(--text)' : 'var(--border)'}`,
                  background: settings.voiceProvider === v.id ? 'var(--text)' : 'transparent',
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{v.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{v.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </SettingSection>

      <SettingSection title="memory">
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>retention period</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min={1}
                max={90}
                value={settings.memoryRetentionDays}
                onChange={(e) => updateSettings({ memoryRetentionDays: Number(e.target.value) })}
                style={{ width: 120, accentColor: 'var(--text)' }}
              />
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{settings.memoryRetentionDays} days</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearMemory}
          style={{
            marginTop: 14,
            padding: '7px 14px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--error)',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'inherit',
          }}
        >
          clear all memory
        </button>
      </SettingSection>

      <button
        onClick={save}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 20px',
          background: 'var(--text)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        <Save size={12} />
        {saved ? 'saved' : 'save settings'}
      </button>
    </div>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
