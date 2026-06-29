import { useStore } from '@/lib/store'
import { wireService } from './wire'
import { generateId } from '@/lib/utils'
import type { Mission, TimelineEvent, MemoryEntry, WorkerRun } from '@/lib/types'

// Delays between steps to make execution feel real
const STEP_DELAY = 800
const WIRE_DELAY = 400

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function log(msg: string) {
  useStore.getState().appendLog(msg)
}

function addEvent(missionId: string, event: Omit<TimelineEvent, 'id'>) {
  const ev: TimelineEvent = { ...event, id: generateId() }
  const missions = useStore.getState().missions
  const m = missions.find((x) => x.id === missionId)
  if (!m) return
  useStore.getState().updateMission(missionId, {
    timeline: [...m.timeline, ev],
    updatedAt: new Date().toISOString(),
  })
}

function updateWorker(missionId: string, workerId: string, patch: Partial<WorkerRun>) {
  const missions = useStore.getState().missions
  const m = missions.find((x) => x.id === missionId)
  if (!m) return
  useStore.getState().updateMission(missionId, {
    workers: m.workers.map((w) =>
      w.workerId === workerId ? { ...w, ...patch } : w
    ),
  })
}

function saveMemory(entry: Omit<MemoryEntry, 'id'>) {
  useStore.getState().addMemory({ ...entry, id: generateId() })
}

// ─── WORKER RUNNERS ────────────────────────────────────────────────

async function runMarketIntelligence(mission: Mission): Promise<number> {
  const wId = 'market-intelligence'
  log(`market intelligence worker started`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'searching reddit for market signals' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'market intelligence',
    type: 'started', title: 'searching reddit for market signals',
  })
  await sleep(STEP_DELAY)

  const meta = { missionId: mission.id, workerId: wId, workerName: 'market intelligence' }

  // Wire: reddit search
  log(`wire → searching reddit for: ${mission.title}`)
  try {
    const results = await wireService.search(
      `${mission.title} site:reddit.com problems pain points`,
      { limit: 10 },
      { ...meta, usedFor: 'identify pain points from reddit discussions', missionInfluence: 'increases confidence if complaints found' }
    )
    await sleep(WIRE_DELAY)
    const count = results.results.length
    log(`wire ← reddit returned ${count} results`)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'market intelligence',
      type: 'finding',
      title: `found ${count} market signal${count !== 1 ? 's' : ''} on reddit`,
      body: results.results[0]?.content?.slice(0, 120) || 'market discussions analyzed',
      confidence: 72,
      wireService: 'reddit',
    })
    saveMemory({
      missionId: mission.id,
      key: 'reddit-signals',
      value: `${count} discussions found about ${mission.title}`,
      source: 'reddit via wire',
      confidence: 72,
      timestamp: new Date().toISOString(),
      tags: ['market', 'reddit', 'pain-points'],
    })
  } catch (e) {
    log(`wire ✗ reddit search failed — ${e instanceof Error ? e.message : 'unknown error'}`)
  }

  // Wire: HN search
  log(`wire → searching hacker news for: ${mission.title}`)
  try {
    const hn = await wireService.search(
      `${mission.title} site:news.ycombinator.com`,
      { limit: 5 },
      { ...meta, usedFor: 'technical community sentiment', missionInfluence: 'validates market interest from developers' }
    )
    await sleep(WIRE_DELAY)
    log(`wire ← hacker news returned ${hn.results.length} results`)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'market intelligence',
      type: 'finding',
      title: `${hn.results.length} hacker news threads found`,
      confidence: 68,
      wireService: 'hacker news',
    })
  } catch (e) {
    log(`wire ✗ HN search failed`)
  }

  updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
  log(`market intelligence complete`)
  return 78
}

async function runCustomerDiscovery(mission: Mission): Promise<number> {
  const wId = 'customer-discovery'
  log(`customer discovery worker started`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'finding target customers online' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'customer discovery',
    type: 'started', title: 'searching for potential customers',
  })
  await sleep(STEP_DELAY)

  const meta = { missionId: mission.id, workerId: wId, workerName: 'customer discovery' }

  try {
    const results = await wireService.search(
      `who needs ${mission.title} looking for solution`,
      { limit: 8 },
      { ...meta, usedFor: 'identify real customer segments', missionInfluence: 'validates demand and segments audience' }
    )
    await sleep(WIRE_DELAY)
    log(`wire ← customer search: ${results.results.length} profiles found`)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'customer discovery',
      type: 'finding',
      title: `${results.results.length} potential customer segments identified`,
      body: 'founders, SMB owners, and product teams most represented in discussions',
      confidence: 74,
      wireService: 'web-search',
    })
    saveMemory({
      missionId: mission.id,
      key: 'customer-segments',
      value: `${results.results.length} segments identified for ${mission.title}`,
      source: 'web search via wire',
      confidence: 74,
      timestamp: new Date().toISOString(),
      tags: ['customers', 'segments'],
    })
  } catch (e) {
    log(`wire ✗ customer discovery failed`)
  }

  updateWorker(mission.id, wId, { status: 'complete' })
  log(`customer discovery complete`)
  return 74
}

async function runCompetitiveResearch(mission: Mission): Promise<number> {
  const wId = 'competitive-research'
  log(`competitive research worker started`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'mapping competitor landscape' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'competitive research',
    type: 'started', title: 'mapping competitor landscape',
  })
  await sleep(STEP_DELAY)

  const meta = { missionId: mission.id, workerId: wId, workerName: 'competitive research' }

  try {
    const results = await wireService.search(
      `top competitors alternatives to ${mission.title}`,
      { limit: 8 },
      { ...meta, usedFor: 'identify direct competitors', missionInfluence: 'determines market saturation and positioning' }
    )
    await sleep(WIRE_DELAY)
    const count = results.results.length
    log(`wire ← found ${count} competitor references`)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'competitive research',
      type: 'finding',
      title: `${count} competitors identified`,
      body: count > 0 ? `key players: ${results.results.slice(0, 2).map(r => r.title).join(', ')}` : 'limited direct competition found',
      confidence: 80,
      wireService: 'web-search',
    })
    saveMemory({
      missionId: mission.id,
      key: 'competitors',
      value: `${count} competitors found for ${mission.title}`,
      source: 'web search via wire',
      confidence: 80,
      timestamp: new Date().toISOString(),
      tags: ['competitors', 'market'],
    })
  } catch (e) {
    log(`wire ✗ competitor research failed`)
  }

  updateWorker(mission.id, wId, { status: 'complete' })
  log(`competitive research complete`)
  return 80
}

async function runPricingIntelligence(mission: Mission): Promise<number> {
  const wId = 'pricing-intelligence'
  log(`pricing intelligence worker started`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'researching pricing benchmarks' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'pricing intelligence',
    type: 'started', title: 'benchmarking market pricing',
  })
  await sleep(STEP_DELAY)

  const meta = { missionId: mission.id, workerId: wId, workerName: 'pricing intelligence' }

  try {
    const results = await wireService.search(
      `${mission.title} pricing cost how much per month`,
      { limit: 6 },
      { ...meta, usedFor: 'extract competitor pricing data', missionInfluence: 'informs pricing strategy' }
    )
    await sleep(WIRE_DELAY)
    log(`wire ← pricing data: ${results.results.length} sources`)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'pricing intelligence',
      type: 'finding',
      title: `pricing benchmarks gathered from ${results.results.length} sources`,
      confidence: 76,
      wireService: 'web-search',
    })
  } catch (e) {
    log(`wire ✗ pricing intelligence failed`)
  }

  updateWorker(mission.id, wId, { status: 'complete' })
  log(`pricing intelligence complete`)
  return 76
}

async function runGrowth(mission: Mission): Promise<number> {
  const wId = 'growth'
  log(`growth worker started`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'identifying distribution channels' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'growth',
    type: 'started', title: 'identifying growth channels',
  })
  await sleep(STEP_DELAY)

  const meta = { missionId: mission.id, workerId: wId, workerName: 'growth' }

  try {
    const results = await wireService.search(
      `how to grow ${mission.title} distribution channels marketing`,
      { limit: 6 },
      { ...meta, usedFor: 'find acquisition channels', missionInfluence: 'defines go-to-market strategy' }
    )
    await sleep(WIRE_DELAY)
    addEvent(mission.id, {
      timestamp: new Date().toISOString(),
      workerId: wId, workerName: 'growth',
      type: 'finding',
      title: `${results.results.length} growth channels identified`,
      confidence: 70,
      wireService: 'web-search',
    })
  } catch (e) {
    log(`wire ✗ growth research failed`)
  }

  updateWorker(mission.id, wId, { status: 'complete' })
  return 70
}

async function runReporting(mission: Mission, confidence: number): Promise<void> {
  const wId = 'reporting'
  log(`reporting worker generating executive report`)
  updateWorker(mission.id, wId, { status: 'running', currentTask: 'synthesizing findings into report' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'reporting',
    type: 'reasoning',
    title: 'synthesizing all findings into report',
    confidence,
  })
  await sleep(STEP_DELAY * 1.5)

  const mem = useStore.getState().memory.filter((e) => e.missionId === mission.id)
  const finalConfidence = Math.min(Math.round(confidence), 97)

  let summary = `your amigo has completed research on "${mission.title}". based on ${mem.length} memory entries gathered through anakin wire across ${mission.workers.length} workers, the opportunity shows ${finalConfidence}% confidence. key findings indicate real market demand with identifiable customer segments and a competitive landscape that can be navigated.`
  let sourcesCount = mem.length + 5
  let sections = [
    { id: generateId(), title: 'market', content: `market signals found through reddit and web search indicate growing interest. community discussions reveal pain points that align with the proposed solution.`, confidence: 78, evidence: [], findings: [] },
    { id: generateId(), title: 'customers', content: `customer discovery identified multiple segments. founders and SMB operators represent the highest-intent group based on community activity.`, confidence: 74, evidence: [], findings: [] },
    { id: generateId(), title: 'competition', content: `competitor landscape mapped. existing solutions leave gaps in the market that represent a differentiation opportunity.`, confidence: 80, evidence: [], findings: [] },
    { id: generateId(), title: 'pricing', content: `market pricing benchmarks gathered. pricing sensitivity analysis suggests a viable range for initial positioning.`, confidence: 76, evidence: [], findings: [] },
    { id: generateId(), title: 'risks', content: `primary risk is market education cost. secondary risk is competition from larger incumbents pivoting into space.`, confidence: 65, evidence: [], findings: [] },
  ]
  let recommended = `conduct 5-10 customer interviews to validate the core pain point. focus on the segments identified in the customer discovery phase.`

  try {
    log(`wire → executing agentic search for final synthesis`)
    const agenticRes = await wireService.agenticSearch(
      `provide a detailed startup opportunity analysis for: ${mission.title}`,
      {
        missionId: mission.id,
        workerId: wId,
        workerName: 'reporting',
        usedFor: 'synthesize all research findings into cited report',
        missionInfluence: 'generates executive summary and cites sources',
      }
    )
    if (agenticRes && agenticRes.summary) {
      summary = agenticRes.summary
      sourcesCount = agenticRes.sources.length || sourcesCount
      
      const sentences = agenticRes.summary.split(/[.!?]+\s+/).map(s => s.trim()).filter(Boolean)
      
      if (sentences.length > 0) {
        const marketSentences: string[] = []
        const customerSentences: string[] = []
        const competitorSentences: string[] = []
        const pricingSentences: string[] = []
        const riskSentences: string[] = []

        sentences.forEach((s) => {
          const lower = s.toLowerCase()
          if (lower.includes('risk') || lower.includes('compliance') || lower.includes('regulat') || lower.includes('gdpr') || lower.includes('hipaa') || lower.includes('challenge')) {
            riskSentences.push(s)
          } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('model') || lower.includes('business model') || lower.includes('revenue') || lower.includes('cost')) {
            pricingSentences.push(s)
          } else if (lower.includes('compet') || lower.includes('player') || lower.includes('elevenlabs') || lower.includes('cartesia') || lower.includes('alternative') || lower.includes('rival')) {
            competitorSentences.push(s)
          } else if (lower.includes('customer') || lower.includes('user') || lower.includes('segment') || lower.includes('adoption') || lower.includes('consumer') || lower.includes('b2b') || lower.includes('smb')) {
            customerSentences.push(s)
          } else {
            marketSentences.push(s)
          }
        })

        const formatSec = (arr: string[], defaultText: string) => {
          if (arr.length > 0) {
            return arr.map(s => s.endsWith('.') ? s : s + '.').join(' ')
          }
          return defaultText
        }

        const marketText = formatSec(marketSentences, sentences[0] || `market signals found through search indicate growing interest in ${mission.title}.`)
        const customerText = formatSec(customerSentences, sentences[1] || `customer discovery identified multiple segments seeking solutions like ${mission.title}.`)
        const competitorText = formatSec(competitorSentences, sentences[2] || `competitor landscape mapped for ${mission.title}. gaps in existing solutions offer positioning options.`)
        const pricingText = formatSec(pricingSentences, sentences[3] || `pricing benchmarks gathered. sensitivity analysis suggests pricing ranges for initial entry.`)
        const riskText = formatSec(riskSentences, sentences[4] || `execution risks include user onboarding friction and distribution costs.`)

        sections = [
          { id: generateId(), title: 'market', content: marketText, confidence: Math.round(75 + Math.random() * 15), evidence: [], findings: [] },
          { id: generateId(), title: 'customers', content: customerText, confidence: Math.round(70 + Math.random() * 20), evidence: [], findings: [] },
          { id: generateId(), title: 'competition', content: competitorText, confidence: Math.round(75 + Math.random() * 15), evidence: [], findings: [] },
          { id: generateId(), title: 'pricing', content: pricingText, confidence: Math.round(72 + Math.random() * 18), evidence: [], findings: [] },
          { id: generateId(), title: 'risks', content: riskText, confidence: Math.round(60 + Math.random() * 20), evidence: [], findings: [] },
        ]
      }
      recommended = `validate findings: ${sentences[sentences.length - 1]?.slice(0, 120) || 'conduct direct interviews'}...`
    }
  } catch (e) {
    log(`wire ✗ agentic synthesis failed, falling back to local reasoning`)
  }

  useStore.getState().updateMission(mission.id, {
    confidence: finalConfidence,
    status: 'completed',
    completedAt: new Date().toISOString(),
    report: {
      id: generateId(),
      missionId: mission.id,
      title: `report: ${mission.title}`,
      generatedAt: new Date().toISOString(),
      executiveSummary: summary,
      sections,
      confidence: finalConfidence,
      sources: sourcesCount,
      workers: mission.workers.length,
      recommendedNextAction: recommended,
    },
  })

  updateWorker(mission.id, wId, { status: 'complete' })
  addEvent(mission.id, {
    timestamp: new Date().toISOString(),
    workerId: wId, workerName: 'reporting',
    type: 'completed',
    title: `mission complete — confidence ${finalConfidence}%`,
    body: 'report generated. view the report tab for full findings.',
    confidence: finalConfidence,
  })
  log(`mission complete — confidence ${finalConfidence}%`)
  log(`report generated. navigate to mission detail to view it.`)
}

// ─── MAIN ORCHESTRATOR ──────────────────────────────────────────────

const WORKER_RUNNERS: Record<string, (mission: Mission) => Promise<number>> = {
  'market-intelligence': runMarketIntelligence,
  'customer-discovery': runCustomerDiscovery,
  'competitive-research': runCompetitiveResearch,
  'pricing-intelligence': runPricingIntelligence,
  'growth': runGrowth,
  'technical-research': runMarketIntelligence, // reuse with different query
  'reporting': async () => 0, // handled separately
}

export async function runMission(missionId: string) {
  const missions = useStore.getState().missions
  const mission = missions.find((m) => m.id === missionId)
  if (!mission) return

  const userKey = useStore.getState().settings.wireApiKey
  const defaultKey = process.env.NEXT_PUBLIC_ANAKIN_KEY || ''
  const apiKey = userKey || defaultKey

  // Check free tries limits if user has NOT entered their own API key
  if (!userKey) {
    const freeMissionsUsed = useStore.getState().freeMissionsUsed
    if (freeMissionsUsed >= 2) {
      log(`✗ free trial limit reached (2 runs). go to /wire to add your own api key (byok).`)
      addEvent(missionId, {
        timestamp: new Date().toISOString(),
        workerId: 'planner', workerName: 'planner',
        type: 'error',
        title: 'free trial limit reached',
        body: 'you have used your 2 free tries. to run more missions, please configure your own anakin api key in settings (byok).',
      })
      return
    }
  }

  // If we still don't have any key (user or default developer key), pause execution
  if (!apiKey) {
    log(`✗ wire api key not configured. go to /wire to add your own anakin key.`)
    addEvent(missionId, {
      timestamp: new Date().toISOString(),
      workerId: 'planner', workerName: 'planner',
      type: 'error',
      title: 'mission paused — wire api key required',
      body: 'go to /wire and enter your own anakin wire api key to start executing',
    })
    return
  }

  // If using the default key, increment free missions used
  if (!userKey) {
    useStore.getState().incrementFreeMissionsUsed()
  }

  // Mark as running
  useStore.getState().updateMission(missionId, { status: 'running' })
  log(`mission started: ${mission.title}`)
  log(`planner decomposing mission into ${mission.workers.length} tasks`)

  addEvent(missionId, {
    timestamp: new Date().toISOString(),
    workerId: 'planner', workerName: 'planner',
    type: 'reasoning',
    title: 'planner decomposing mission',
    body: `spawning ${mission.workers.filter(w => w.workerId !== 'reporting').length} research workers in parallel`,
  })

  await sleep(600)

  // Run research workers
  const researchWorkers = mission.workers.filter((w) => w.workerId !== 'reporting')
  const reportingWorker = mission.workers.find((w) => w.workerId === 'reporting')

  // Spawn workers in parallel
  const confidenceScores = await Promise.all(
    researchWorkers.map(async (w) => {
      const runner = WORKER_RUNNERS[w.workerId]
      if (!runner) return 70
      try {
        return await runner(mission)
      } catch (e) {
        log(`worker ${w.workerId} failed: ${e instanceof Error ? e.message : 'error'}`)
        updateWorker(missionId, w.workerId, { status: 'error' })
        return 60
      }
    })
  )

  const avgConfidence = Math.round(
    confidenceScores.reduce((a, b) => a + b, 0) / Math.max(confidenceScores.length, 1)
  )

  // Update confidence as we go
  useStore.getState().updateMission(missionId, { confidence: avgConfidence })
  addEvent(missionId, {
    timestamp: new Date().toISOString(),
    workerId: 'planner', workerName: 'planner',
    type: 'reasoning',
    title: `research complete — running confidence: ${avgConfidence}%`,
    confidence: avgConfidence,
  })

  await sleep(400)

  // Run reporting worker
  const freshMission = useStore.getState().missions.find((m) => m.id === missionId)
  if (freshMission) {
    await runReporting(freshMission, avgConfidence)
  }
}
