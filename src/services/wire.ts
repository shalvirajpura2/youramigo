import type { WireRequest } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { useStore } from '@/lib/store'

export interface ScrapeOptions {
  generateJson?: boolean
  format?: 'markdown' | 'json' | 'html'
  query?: string
}

export interface SearchOptions {
  limit?: number
  includeContent?: boolean
}

export interface WireServiceOptions {
  missionId: string
  workerId: string
  workerName: string
  usedFor?: string
  missionInfluence?: string
}

const WIRE_BASE = 'https://api.anakin.io/v1'

class WireService {
  private getApiKey(): string {
    // Read from store at call time to always get latest
    const userKey = useStore.getState().settings.wireApiKey
    if (userKey) return userKey

    // Fallback to configured key on the user's side (env variable or custom fallback)
    const defaultKey = process.env.NEXT_PUBLIC_ANAKIN_API_KEY || ''
    return defaultKey
  }

  private log(line: string) {
    useStore.getState().appendLog(line)
  }

  private trackRequest(partial: Partial<WireRequest>): string {
    const id = generateId()
    const req: WireRequest = {
      id,
      missionId: '',
      workerId: '',
      workerName: '',
      service: '',
      endpoint: '',
      status: 'pending',
      latencyMs: 0,
      cached: false,
      retryCount: 0,
      requestedAt: new Date().toISOString(),
      ...partial,
    }
    useStore.getState().addWireRequest(req)
    return id
  }

  private completeRequest(id: string, patch: Partial<WireRequest>) {
    useStore.getState().updateWireRequest(id, patch)
  }

  // Core scrape endpoint
  async scrape(
    url: string,
    options: ScrapeOptions,
    meta: WireServiceOptions,
    retryCount = 0
  ): Promise<{ content: string; data?: unknown; cached: boolean }> {
    const apiKey = this.getApiKey()
    if (!apiKey) throw new Error('wire api key not configured')

    const reqId = this.trackRequest({
      missionId: meta.missionId,
      workerId: meta.workerId,
      workerName: meta.workerName,
      service: this.extractService(url),
      endpoint: '/scrape',
      url,
      status: 'pending',
      retryCount,
      usedFor: meta.usedFor,
      missionInfluence: meta.missionInfluence,
    })

    this.log(`wire → scrape ${url}`)

    const start = Date.now()
    try {
      const res = await fetch(`${WIRE_BASE}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          url,
          generate_json: options.generateJson,
          format: options.format || 'markdown',
        }),
      })

      const latencyMs = Date.now() - start
      const data = await res.json()
      const cached = res.headers.get('x-cache') === 'HIT'

      this.completeRequest(reqId, {
        status: res.ok ? 'success' : 'error',
        latencyMs,
        cached,
        completedAt: new Date().toISOString(),
        response: data,
        responseSize: JSON.stringify(data).length,
      })

      this.log(`wire ← ${res.ok ? 'ok' : 'error'} ${latencyMs}ms${cached ? ' [cached]' : ''}`)

      if (!res.ok && retryCount < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
        return this.scrape(url, options, meta, retryCount + 1)
      }

      return {
        content: data.markdown || data.content || JSON.stringify(data),
        data: options.generateJson ? data.json : undefined,
        cached,
      }
    } catch (err) {
      const latencyMs = Date.now() - start
      this.completeRequest(reqId, { status: 'error', latencyMs })
      this.log(`wire ✗ error scraping ${url}`)

      if (retryCount < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
        return this.scrape(url, options, meta, retryCount + 1)
      }
      throw err
    }
  }

  // Search endpoint
  async search(
    query: string,
    options: SearchOptions,
    meta: WireServiceOptions,
    retryCount = 0
  ): Promise<{ results: Array<{ title: string; url: string; content: string }>; cached: boolean }> {
    const apiKey = this.getApiKey()
    if (!apiKey) throw new Error('wire api key not configured')

    const reqId = this.trackRequest({
      missionId: meta.missionId,
      workerId: meta.workerId,
      workerName: meta.workerName,
      service: 'web-search',
      endpoint: '/search',
      query,
      status: 'pending',
      retryCount,
      usedFor: meta.usedFor,
      missionInfluence: meta.missionInfluence,
    })

    this.log(`wire → search "${query}"`)

    const start = Date.now()
    try {
      const res = await fetch(`${WIRE_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt: query, limit: options.limit || 10 }),
      })

      const latencyMs = Date.now() - start
      const data = await res.json()
      const cached = res.headers.get('x-cache') === 'HIT'

      this.completeRequest(reqId, {
        status: res.ok ? 'success' : 'error',
        latencyMs,
        cached,
        completedAt: new Date().toISOString(),
        response: data,
        responseSize: JSON.stringify(data).length,
      })

      this.log(`wire ← search ${latencyMs}ms ${data.results?.length || 0} results`)

      if (!res.ok && retryCount < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
        return this.search(query, options, meta, retryCount + 1)
      }

      return { results: data.results || [], cached }
    } catch (err) {
      const latencyMs = Date.now() - start
      this.completeRequest(reqId, { status: 'error', latencyMs })
      this.log(`wire ✗ search error`)
      throw err
    }
  }

  // Agentic search — multi-stage research pipeline
  async agenticSearch(
    query: string,
    meta: WireServiceOptions
  ): Promise<{ summary: string; sources: string[]; cached: boolean }> {
    const apiKey = this.getApiKey()
    if (!apiKey) throw new Error('wire api key not configured')

    const reqId = this.trackRequest({
      missionId: meta.missionId,
      workerId: meta.workerId,
      workerName: meta.workerName,
      service: 'agentic-search',
      endpoint: '/agentic-search',
      query,
      status: 'pending',
      usedFor: meta.usedFor,
      missionInfluence: meta.missionInfluence,
    })

    this.log(`wire → agentic search "${query}"`)

    const start = Date.now()
    try {
      // 1. Submit the agentic search job
      const res = await fetch(`${WIRE_BASE}/agentic-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt: query }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `HTTP ${res.status}`)
      }

      const submitData = await res.json()
      const jobId = submitData.job_id || submitData.id
      if (!jobId) {
        throw new Error('no job_id returned from search endpoint')
      }

      this.log(`wire ← job queued: ${jobId}`)

      // 2. Poll for results
      let status = 'pending'
      let attempts = 0
      const maxAttempts = 30
      let pollData: any = null

      while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
        attempts++
        await new Promise((r) => setTimeout(r, 2000)) // Wait 2s
        
        this.log(`wire → polling job status [attempt ${attempts}/${maxAttempts}]`)
        
        const pollRes = await fetch(`${WIRE_BASE}/agentic-search/${jobId}`, {
          headers: {
            'X-API-Key': apiKey,
          },
        })

        if (!pollRes.ok) {
          this.log(`wire ✗ poll attempt failed: HTTP ${pollRes.status}`)
          continue
        }

        pollData = await pollRes.json()
        status = pollData.status || 'pending'
        
        this.log(`wire ← job status: ${status}`)
      }

      const latencyMs = Date.now() - start

      if (status !== 'completed') {
        throw new Error(`agentic search job failed or timed out with status: ${status}`)
      }

      this.completeRequest(reqId, {
        status: 'success',
        latencyMs,
        completedAt: new Date().toISOString(),
        response: pollData,
      })

      const generated = pollData.generatedJson || {}
      const summary = generated.summary || pollData.summary || ''
      
      // Extract sources
      let sources: string[] = []
      if (generated.structured_data?.sources) {
        sources = generated.structured_data.sources
      } else {
        const matches = summary.match(/https?:\/\/[^\s\)]+/g)
        sources = matches ? Array.from(new Set(matches)) : []
      }

      this.log(`wire ← agentic search complete in ${Math.round(latencyMs / 1000)}s with ${sources.length} sources`)

      return {
        summary,
        sources,
        cached: false,
      }
    } catch (err) {
      const latencyMs = Date.now() - start
      this.completeRequest(reqId, { status: 'error', latencyMs })
      this.log(`wire ✗ agentic search failed: ${err instanceof Error ? err.message : 'error'}`)
      throw err
    }
  }

  // Crawl endpoint
  async crawl(
    url: string,
    meta: WireServiceOptions
  ): Promise<{ pages: Array<{ url: string; content: string }> }> {
    const apiKey = this.getApiKey()
    if (!apiKey) throw new Error('wire api key not configured')

    const reqId = this.trackRequest({
      missionId: meta.missionId,
      workerId: meta.workerId,
      workerName: meta.workerName,
      service: this.extractService(url),
      endpoint: '/crawl',
      url,
      status: 'pending',
      usedFor: meta.usedFor,
    })

    this.log(`wire → crawl ${url}`)

    const start = Date.now()
    try {
      const res = await fetch(`${WIRE_BASE}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ url, limit: 20 }),
      })

      const latencyMs = Date.now() - start
      const data = await res.json()

      this.completeRequest(reqId, {
        status: res.ok ? 'success' : 'error',
        latencyMs,
        completedAt: new Date().toISOString(),
        response: data,
      })

      this.log(`wire ← crawl ${latencyMs}ms ${data.pages?.length || 0} pages`)

      return { pages: data.pages || [] }
    } catch (err) {
      const latencyMs = Date.now() - start
      this.completeRequest(reqId, { status: 'error', latencyMs })
      throw err
    }
  }

  private extractService(url: string): string {
    try {
      const host = new URL(url).hostname.replace('www.', '')
      if (host.includes('reddit')) return 'reddit'
      if (host.includes('github')) return 'github'
      if (host.includes('linkedin')) return 'linkedin'
      if (host.includes('producthunt')) return 'product hunt'
      if (host.includes('news.ycombinator')) return 'hacker news'
      return host.split('.')[0]
    } catch {
      return 'unknown'
    }
  }
}

// Singleton
export const wireService = new WireService()
