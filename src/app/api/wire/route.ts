import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { endpoint, method, payload, userKey } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })
    }

    // Target URL on Anakin
    const url = `https://api.anakin.io/v1${endpoint}`

    // Resolve API key: use user's BYOK key if provided, else fall back to private server-side ANAKIN_KEY
    const apiKey = userKey || process.env.ANAKIN_KEY || ''

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    }

    const response = await fetch(url, {
      method: method || 'POST',
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Anakin API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
