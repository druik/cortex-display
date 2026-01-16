import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const USER_ID = '195145f9-d059-4a71-8722-fa61ecc911f3'
const PROVIDER = 'apple_shortcuts'

interface NormalizedEvent {
  title: string
  start_at: string
}

function normalizeEvents(body: unknown): NormalizedEvent[] | null {
  if (Array.isArray(body)) {
    return body.map((e) => ({
      title: e.title || e.Title || '',
      start_at: e.start_at || e['Start Date'] || ''
    }))
  }
  if (body && typeof body === 'object' && 'events' in body && Array.isArray((body as { events: unknown[] }).events)) {
    return (body as { events: Array<{ title?: string; start_at?: string }> }).events.map((e) => ({
      title: e.title || '',
      start_at: e.start_at || ''
    }))
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.CORTEX_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const events = normalizeEvents(body)
    if (!events) {
      return NextResponse.json({ error: 'events array required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('calendar_events_cache')
      .delete()
      .eq('user_id', USER_ID)
      .eq('provider', PROVIDER)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    if (events.length === 0) {
      return NextResponse.json({ synced: 0 })
    }

    const rows = events.map((e) => ({
      user_id: USER_ID,
      provider: PROVIDER,
      title: e.title,
      start_at: e.start_at,
      fetched_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabase
      .from('calendar_events_cache')
      .insert(rows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ synced: events.length })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
