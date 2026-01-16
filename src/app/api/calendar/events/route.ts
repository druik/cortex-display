import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID, isValidApiKey } from '@/lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
const PROVIDER = 'apple_shortcuts'

interface NormalizedEvent {
  title: string
  start_at: string
}

function isValidDate(str: string): boolean {
  const d = new Date(str)
  return !isNaN(d.getTime())
}

function normalizeEvents(body: unknown): NormalizedEvent[] | null {
  let raw: unknown[] | null = null

  if (Array.isArray(body)) {
    raw = body
  } else if (body && typeof body === 'object' && 'events' in body && Array.isArray((body as { events: unknown[] }).events)) {
    raw = (body as { events: unknown[] }).events
  }

  if (!raw) return null

  return raw.map((e: unknown) => {
    const evt = e as Record<string, unknown>
    return {
      title: String(evt.title || evt.Title || '').trim(),
      start_at: String(evt.start_at || evt['Start Date'] || '')
    }
  })
}

function validateEvents(events: NormalizedEvent[]): string | null {
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (!e.title) {
      return `Event ${i + 1}: title is required`
    }
    if (!e.start_at || !isValidDate(e.start_at)) {
      return `Event ${i + 1}: valid start_at date is required`
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!isValidApiKey(request.headers.get('x-api-key'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const events = normalizeEvents(body)
    if (!events) {
      return NextResponse.json({ error: 'Events array required' }, { status: 400 })
    }

    const validationError = validateEvents(events)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('calendar_events_cache')
      .delete()
      .eq('user_id', USER_ID)
      .eq('provider', PROVIDER)

    if (deleteError) {
      console.error('Calendar events delete failed:', deleteError)
      return NextResponse.json({ error: 'Failed to sync events' }, { status: 500 })
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
      console.error('Calendar events insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to sync events' }, { status: 500 })
    }

    return NextResponse.json({ synced: events.length })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
