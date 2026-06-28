'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { generateId } from '@/lib/utils'
import { WORKERS } from '@/services/workers'
import type { Mission } from '@/lib/types'
import { ArrowRight, Plus } from 'lucide-react'

const TEMPLATES = [
  { id: 'startup-validation', title: 'startup validation', desc: 'validate your startup idea against real market data', workers: ['market-intelligence', 'customer-discovery', 'competitive-research'] },
  { id: 'competitor-analysis', title: 'competitor analysis', desc: 'deep research on competitors, pricing, and positioning', workers: ['competitive-research', 'pricing-intelligence', 'market-intelligence'] },
  { id: 'market-monitoring', title: 'market monitoring', desc: 'continuous monitoring of your target market', workers: ['market-intelligence', 'customer-discovery'] },
  { id: 'fundraising', title: 'fundraising', desc: 'research investors, comparable deals, and market timing', workers: ['market-intelligence', 'technical-research', 'reporting'] },
  { id: 'customer-discovery', title: 'customer discovery', desc: 'find and understand your first potential customers', workers: ['customer-discovery', 'market-intelligence'] },
  { id: 'launch-prep', title: 'launch preparation', desc: 'prepare for a product launch with market and channel research', workers: ['market-intelligence', 'customer-discovery', 'growth', 'competitive-research'] },
  { id: 'growth-audit', title: 'growth audit', desc: 'audit distribution channels and growth opportunities', workers: ['growth', 'market-intelligence', 'technical-research'] },
  { id: 'pricing-intelligence', title: 'pricing intelligence', desc: 'benchmark your pricing against the market', workers: ['pricing-intelligence', 'competitive-research'] },
]

export default function MissionsPage() {
  const router = useRouter()
  const { missions, addMission, settings } = useStore()
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)

  const activeMissions = missions.filter((m) => m.status === 'running' || m.status === 'planning')
  const completedMissions = missions.filter((m) => m.status === 'completed')

  const createMission = async (title: string, templateId?: string) => {
    if (!title.trim()) return
    const template = TEMPLATES.find((t) => t.id === templateId)
    const defaultWorkers = ['market-intelligence', 'customer-discovery', 'competitive-research', 'reporting']
    const workerIds = template ? template.workers : defaultWorkers
    const id = generateId()
    const now = new Date().toISOString()

    const mission: Mission = {
      id,
      title: title.trim(),
      description: template?.desc || title.trim(),
      status: 'planning',
      template: templateId,
      createdAt: now,
      updatedAt: now,
      workers: workerIds.map((wId) => ({
        workerId: wId,
        missionId: id,
        status: 'idle',
        wireRequests: 0,
        findings: 0,
        memory: [],
      })),
      wireRequests: 0,
      confidence: 0,
      findings: [],
      timeline: [
        {
          id: generateId(),
          timestamp: now,
          workerId: 'planner',
          workerName: 'planner',
          type: 'started',
          title: 'mission created',
          body: `workers assigned: ${workerIds.length}`,
        },
      ],
    }

    addMission(mission)
    setInput('')
    setCreating(false)
    router.push(`/missions/${id}`)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>
      {/* header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          missions
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          what should your amigo work on?
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          assign a mission in plain language. workers will decompose, research, and deliver.
        </p>
      </div>

      {/* mission input */}
      <div style={{ marginBottom: 32 }}>
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
            onKeyDown={(e) => e.key === 'Enter' && createMission(input)}
            placeholder="describe a mission..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '13px 16px',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => createMission(input)}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? 'var(--text)' : 'var(--border)',
              color: input.trim() ? 'var(--bg)' : 'var(--text-3)',
              border: 'none',
              padding: '0 20px',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            start <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* templates */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          templates
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => createMission(t.title, t.id)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--card)',
                cursor: 'pointer',
                transition: 'all 0.1s',
                fontFamily: 'inherit',
              }}
              className="card-hover"
            >
              <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4, fontWeight: 500 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{t.desc}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                {t.workers.length} workers
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* active missions */}
      {activeMissions.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            active
          </div>
          {activeMissions.map((m) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </div>
      )}

      {/* completed missions */}
      {completedMissions.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            completed
          </div>
          {completedMissions.map((m) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </div>
      )}

      {missions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>no missions yet. start one above.</p>
        </div>
      )}
    </div>
  )
}

function MissionRow({ mission }: { mission: Mission }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/missions/${mission.id}`)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--card)',
        cursor: 'pointer',
        marginBottom: 6,
        transition: 'all 0.1s',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
      className="card-hover"
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, marginBottom: 3 }}>{mission.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
          {mission.workers.length} workers · {mission.wireRequests} wire requests
          {mission.confidence > 0 && ` · ${mission.confidence}% confidence`}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {mission.status === 'running' && (
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', display: 'inline-block' }} className="animate-pulse-dot" />
        )}
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{mission.status}</span>
        <ArrowRight size={11} style={{ color: 'var(--text-3)' }} />
      </div>
    </button>
  )
}
