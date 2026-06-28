import type { WorkerDefinition } from '@/lib/types'

export const WORKERS: WorkerDefinition[] = [
  {
    id: 'market-intelligence',
    name: 'market intelligence',
    role: 'market researcher',
    description: 'monitors reddit, hacker news, twitter, and news for market signals, pain points, and emerging trends',
    capabilities: ['trend detection', 'pain point analysis', 'signal aggregation', 'sentiment analysis'],
    sources: ['reddit', 'hacker news', 'news', 'twitter'],
    icon: 'TrendingUp',
  },
  {
    id: 'customer-discovery',
    name: 'customer discovery',
    role: 'customer researcher',
    description: 'finds real customers, validates demand, and surfaces direct feedback from communities where your target users spend time',
    capabilities: ['customer identification', 'demand validation', 'feedback synthesis', 'community analysis'],
    sources: ['reddit', 'linkedin', 'product hunt', 'hacker news'],
    icon: 'Users',
  },
  {
    id: 'competitive-research',
    name: 'competitive research',
    role: 'competitor watcher',
    description: 'tracks competitor products, pricing changes, reviews, and positioning across the web',
    capabilities: ['competitor tracking', 'pricing monitoring', 'review analysis', 'feature comparison'],
    sources: ['company websites', 'g2', 'capterra', 'product hunt'],
    icon: 'Radar',
  },
  {
    id: 'pricing-intelligence',
    name: 'pricing intelligence',
    role: 'pricing analyst',
    description: 'scrapes pricing pages, tracks changes, and benchmarks against market rates',
    capabilities: ['pricing extraction', 'change detection', 'benchmarking', 'tier analysis'],
    sources: ['pricing pages', 'stripe', 'reviews'],
    icon: 'DollarSign',
  },
  {
    id: 'growth',
    name: 'growth',
    role: 'growth analyst',
    description: 'identifies distribution channels, partnership opportunities, and organic growth levers',
    capabilities: ['channel analysis', 'partnership research', 'SEO analysis', 'viral loop detection'],
    sources: ['product hunt', 'reddit', 'github', 'linkedin'],
    icon: 'ArrowUpRight',
  },
  {
    id: 'technical-research',
    name: 'technical research',
    role: 'technical analyst',
    description: 'researches technical implementation patterns, open source alternatives, and developer communities',
    capabilities: ['github analysis', 'stack research', 'developer sentiment', 'dependency mapping'],
    sources: ['github', 'hacker news', 'stackoverflow', 'documentation'],
    icon: 'Code',
  },
  {
    id: 'reporting',
    name: 'reporting',
    role: 'report generator',
    description: 'synthesizes all findings into structured evidence-backed reports with confidence scores and recommended actions',
    capabilities: ['synthesis', 'evidence ranking', 'confidence scoring', 'action recommendation'],
    sources: ['memory', 'findings'],
    icon: 'FileText',
  },
]

export function getWorker(id: string): WorkerDefinition | undefined {
  return WORKERS.find((w) => w.id === id)
}
