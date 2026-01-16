import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID } from '@/lib/config'
import { handleCors, optionsResponse, corsHeaders } from '@/lib/cors'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request)
}

export async function GET(request: NextRequest) {
  const corsError = handleCors(request)
  if (corsError) return corsError

  const origin = request.headers.get('origin')

  try {
    const { data, error } = await supabase
      .from('calendar_events_cache')
      .select('title, start_at, provider')
      .eq('user_id', USER_ID)
      .gt('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(5)

    if (error) {
      console.error('Fetch events failed:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    return NextResponse.json(
      { events: data || [], fetched_at: new Date().toISOString() },
      { headers: corsHeaders(origin) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
