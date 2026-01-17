import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID, isValidApiKey } from '@/lib/config'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { handleCors, optionsResponse, corsHeaders } from '@/lib/cors'

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

interface ParsedBody {
  events: NormalizedEvent[]
  clear: boolean
}

function parseBody(body: unknown): ParsedBody | null {
  let raw: unknown[] | null = null
  let clear = false

  if (Array.isArray(body)) {
    raw = body
  } else if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>
    if ('events' in obj && Array.isArray(obj.events)) {
      raw = obj.events
    }
    if ('clear' in obj && obj.clear === true) {
      clear = true
    }
  }

  if (!raw) return null

  const events = raw.map((e: unknown) => {
    const evt = e as Record<string, unknown>
    return {
      title: String(evt.title || evt.Title || '').trim(),
      start_at: String(evt.start_at || evt['Start Date'] || '')
    }
  })

  return { events, clear }
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

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request)
}

export async function POST(request: NextRequest) {
  const corsError = handleCors(request)
  if (corsError) return corsError

  const origin = request.headers.get('origin')
  const ip = getClientIp(request)
  const { allowed, remaining } = rateLimit(ip, 'calendar/events', 10)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': '0' } }
    )
  }

  try {
    if (!isValidApiKey(request.headers.get('x-api-key'))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders(origin) }
      )
    }

    const body = await request.json()
    const parsed = parseBody(body)
    if (!parsed) {
      return NextResponse.json(
        { error: 'Events array required' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const { events, clear } = parsed

    if (events.length === 0 && !clear) {
      return NextResponse.json(
        { error: 'Events array cannot be empty for sync. Use { clear: true, events: [] } to clear all events.' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    if (clear && events.length === 0) {
      const { error: deleteError } = await supabase
        .from('calendar_events_cache')
        .delete()
        .eq('user_id', USER_ID)
        .eq('provider', PROVIDER)

      if (deleteError) {
        console.error('Calendar events clear failed:', deleteError)
        return NextResponse.json(
          { error: 'Failed to clear events' },
          { status: 500, headers: corsHeaders(origin) }
        )
      }

      return NextResponse.json(
        { cleared: true, synced: 0 },
        { headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': String(remaining) } }
      )
    }

    const validationError = validateEvents(events)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const syncTimestamp = new Date().toISOString()
    const rows = events.map((e) => ({
      user_id: USER_ID,
      provider: PROVIDER,
      title: e.title,
      start_at: e.start_at,
      fetched_at: syncTimestamp
    }))

    const { error: insertError } = await supabase
      .from('calendar_events_cache')
      .upsert(rows, { 
        onConflict: 'user_id,title,start_at',
        ignoreDuplicates: true 
      })

    if (insertError) {
      console.error('Calendar events insert failed:', insertError)
      return NextResponse.json(
        { error: 'Failed to sync events' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    const { error: deleteError } = await supabase
      .from('calendar_events_cache')
      .delete()
      .eq('user_id', USER_ID)
      .eq('provider', PROVIDER)
      .lt('fetched_at', syncTimestamp)

    if (deleteError) {
      console.error('Calendar events cleanup failed:', deleteError)
    }

    return NextResponse.json(
      { synced: events.length },
      { headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': String(remaining) } }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }
}
