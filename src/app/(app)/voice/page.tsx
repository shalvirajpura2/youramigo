'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { generateId } from '@/lib/utils'
import type { Mission, VoiceTranscript } from '@/lib/types'
import { Mic, MicOff, Play } from 'lucide-react'

const VOICE_COMMANDS = [
  'validate my healthcare startup idea',
  'research competitors in the crm space',
  'find first customers for my dev tool',
  'monitor pricing changes in saas',
  'prepare investor research for series a',
]

export default function VoicePage() {
  const { addTranscript, transcripts, addMission, settings } = useStore()
  const router = useRouter()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SR()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join('')
        setTranscript(t)
      }

      recognitionRef.current.onend = () => {
        setListening(false)
      }
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      setTranscript('')
      recognitionRef.current?.start()
      setListening(true)
    }
  }

  const submitMission = async (text: string) => {
    if (!text.trim()) return
    setProcessing(true)

    const t: VoiceTranscript = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      input: text,
      confidence: 0.92,
    }

    const missionId = generateId()
    const mission: Mission = {
      id: missionId,
      title: text.trim(),
      description: text.trim(),
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workers: [
        { workerId: 'market-intelligence', missionId: missionId, status: 'idle', wireRequests: 0, findings: 0, memory: [] },
        { workerId: 'customer-discovery', missionId: missionId, status: 'idle', wireRequests: 0, findings: 0, memory: [] },
        { workerId: 'competitive-research', missionId: missionId, status: 'idle', wireRequests: 0, findings: 0, memory: [] },
        { workerId: 'reporting', missionId: missionId, status: 'idle', wireRequests: 0, findings: 0, memory: [] },
      ],
      wireRequests: 0,
      confidence: 0,
      findings: [],
      timeline: [{
        id: generateId(),
        timestamp: new Date().toISOString(),
        workerId: 'voice',
        workerName: 'voice',
        type: 'started',
        title: 'mission created via voice',
      }],
    }

    t.missionCreated = missionId
    addTranscript(t)
    addMission(mission)
    setTranscript('')
    setProcessing(false)
    router.push(`/missions/${missionId}`)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          voice
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          speak a mission
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          describe what you need. your amigo will decompose it into autonomous workflows.
        </p>
      </div>

      {/* listen button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
        <button
          onClick={toggleListen}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `2px solid ${listening ? 'var(--text)' : 'var(--border)'}`,
            background: listening ? 'var(--hover)' : 'var(--card)',
            color: listening ? 'var(--text)' : 'var(--text-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            marginBottom: 20,
          }}
        >
          {listening ? <Mic size={28} /> : <MicOff size={28} />}
        </button>

        {listening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: 6, marginBottom: 20 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [8, 24, 8], transition: { duration: 0.6, repeat: Infinity, delay: i * 0.1 } }}
                style={{ width: 3, borderRadius: 2, background: 'var(--text-2)' }}
              />
            ))}
          </motion.div>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 24 }}>
          {listening ? 'listening...' : 'tap to speak'}
        </p>

        {/* transcript display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--card)',
              padding: '16px 20px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>transcript</div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>{transcript}</p>
            <button
              onClick={() => submitMission(transcript)}
              disabled={processing}
              style={{
                padding: '8px 20px',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Play size={11} />
              {processing ? 'creating mission...' : 'start this mission'}
            </button>
          </motion.div>
        )}

        {/* example commands */}
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            example commands
          </div>
          {VOICE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => submitMission(cmd)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'transparent',
                color: 'var(--text-2)',
                cursor: 'pointer',
                fontSize: 12,
                marginBottom: 6,
                fontFamily: 'inherit',
                transition: 'all 0.1s',
              }}
              className="hover:bg-[var(--hover)] hover:text-white"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>

      {/* transcript history */}
      {transcripts.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            history
          </div>
          {transcripts.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>
                {new Date(t.timestamp).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)' }}>{t.input}</div>
              {t.missionCreated && (
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>→ mission created</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
