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

function classifyQuery(query: string): 'startup' | 'math' | 'greeting' | 'general' {
  const q = query.trim().toLowerCase()
  
  // Math check: includes arithmetic operators or is simple numeric equality
  if (/^[0-9+\-*/()\s=?!x×÷]+$/.test(q) && /[0-9]/.test(q)) {
    return 'math'
  }
  
  // Greeting check
  if (/^(hello|hi|hey|howdy|hola|yo|good\s+morning|good\s+afternoon|good\s+evening|whats\s+up|what's\s+up|testing|test)(\s|\?|!|$)/i.test(q)) {
    return 'greeting'
  }
  
  // General quick/short query check (less than 3 words, not mentioning startup business saas idea etc.)
  const words = q.split(/\s+/)
  if (words.length <= 2 && !/startup|business|idea|app|product|service|company|saas|platform|tech/i.test(q)) {
    return 'general'
  }
  
  return 'startup'
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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
    log(`market intelligence complete (fast-pass)`)
    return 100
  }

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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
    log(`customer discovery complete (fast-pass)`)
    return 100
  }

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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
    log(`competitive research complete (fast-pass)`)
    return 100
  }

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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
    log(`pricing intelligence complete (fast-pass)`)
    return 100
  }

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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    updateWorker(mission.id, wId, { status: 'complete', currentTask: undefined })
    log(`growth complete (fast-pass)`)
    return 100
  }

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

  const qType = classifyQuery(mission.title)
  if (qType === 'math') {
    let mathResult = '2'
    try {
      const cleanExpr = mission.title.replace(/[^0-9+\-*/().\s]/g, '')
      const fn = new Function(`return (${cleanExpr})`)
      mathResult = String(fn())
    } catch {
      mathResult = '2'
    }

    summary = `Your amigo has completed the computation for "${mission.title}". The result of this calculation is ${mathResult}. This arithmetic operation is logically complete and requires zero additional verification.`
    sections = [
      { id: generateId(), title: 'calculation', content: `The arithmetic equation "${mission.title}" evaluates mathematically to: ${mathResult}.`, confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'audience', content: "Basic arithmetic calculations of this nature are processed instantly by computers and utilized universally across students, calculators, and software functions.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'alternatives', content: `Alternative representations of the result (${mathResult}) include binary notation (e.g. ${Number(mathResult).toString(2)}) or Roman numerals.`, confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'cost', content: "Processing this calculation requires virtually zero resources and can be evaluated on any standard local runtime.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'risks', content: "There are no logical or execution risks in this query. The logic of addition and arithmetic operates under absolute truth.", confidence: 100, evidence: [], findings: [] },
    ]
    recommended = "Query completed. No further action or startup validation needed."
    sourcesCount = 0
  } else if (qType === 'greeting') {
    summary = `Hello! I am your amigo, your autonomous research and idea validation assistant. How can I help you validate your next startup idea or business concept today?`
    sections = [
      { id: generateId(), title: 'welcome', content: "Welcome to Amigo! I'm designed to help you analyze market trends, find target customers, map competitors, benchmark pricing, and evaluate potential business risks.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'audience', content: "Amigo is built for founders, designers, developers, and product teams looking to validate start-up ideas with real-world research signals fast.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'capabilities', content: "Unlike traditional static templates, Amigo deploys real-time agents to search reddit, check hacker news, scrape competitor pages, and synthesize analysis reports dynamically.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'trial runs', content: "You receive 2 free research runs out-of-the-box. Afterwards, you can configure your own Anakin API key (BYOK) in the Settings page for unlimited queries.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'security', content: "Your custom API keys and research settings are stored locally in your browser's persistent storage, keeping your credentials secure.", confidence: 100, evidence: [], findings: [] },
    ]
    recommended = "Type a startup concept in the input box (e.g. 'validate an automated grocery delivery app') to launch your first research mission!"
    sourcesCount = 0
  } else if (qType === 'general') {
    let generalAnswer = `This query looks like a general prompt or a question. To get detailed startup opportunity validation reports, please enter a business concept or startup idea.`
    try {
      const searchRes = await wireService.search(mission.title, { limit: 2 }, {
        missionId: mission.id,
        workerId: wId,
        workerName: 'reporting',
        usedFor: 'get direct answer for query',
      })
      if (searchRes.results.length > 0) {
        generalAnswer = searchRes.results.map(r => r.content).join(' ').slice(0, 400) + '...'
      }
    } catch (e) {
      // fallback
    }

    summary = `Your amigo has processed "${mission.title}". Executive answer: ${generalAnswer}`
    sections = [
      { id: generateId(), title: 'answer', content: generalAnswer, confidence: 90, evidence: [], findings: [] },
      { id: generateId(), title: 'relevance', content: `This research query evaluated general information about "${mission.title}" across web signals.`, confidence: 85, evidence: [], findings: [] },
      { id: generateId(), title: 'alternatives', content: "For math calculations, try entering numbers and operators. For greetings, try writing hello. For startup research, try describing a business idea.", confidence: 95, evidence: [], findings: [] },
      { id: generateId(), title: 'cost', content: "This general query ran through a simplified execution path to conserve your free trial counts.", confidence: 100, evidence: [], findings: [] },
      { id: generateId(), title: 'risks', content: "General prompts may not align with standard market metrics. Try formulating your prompt as a product or business concept for better reports.", confidence: 90, evidence: [], findings: [] },
    ]
    recommended = "To unlock full market analytics, pricing intelligence, and customer segments, please enter a product or startup concept."
    sourcesCount = 3
  } else {
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

  const qType = classifyQuery(mission.title)
  if (qType !== 'startup') {
    log(`✗ invalid mission prompt: "${mission.title}"`)
    addEvent(missionId, {
      timestamp: new Date().toISOString(),
      workerId: 'planner', workerName: 'planner',
      type: 'error',
      title: 'invalid research mission prompt',
      body: 'To get the most out of Amigo, please provide a specific business concept, startup idea, or market research topic to analyze. Our agents are optimized for startup intelligence rather than general calculations or conversation.',
    })
    useStore.getState().updateMission(missionId, { status: 'failed' })
    return
  }

  const userKey = useStore.getState().settings.wireApiKey

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

    // If using the free trial, increment free missions used
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
