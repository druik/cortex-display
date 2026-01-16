import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { USER_ID } from '@/lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('calendar_events_cache')
      .select('title, start_at, provider')
      .eq('user_id', USER_ID)
      .gt('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      event: data || null,
      fetched_at: new Date().toISOString()
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
