import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const DEMO_USER_ID = process.env.DEMO_USER_ID!

const publicCorsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, remaining } = rateLimit(ip, 'demo/capture', 5)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Limited to 5 per minute.' },
      { status: 429, headers: { ...publicCorsHeaders, 'X-RateLimit-Remaining': '0' } }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: publicCorsHeaders }
    )
  }

  const rawTitle = body.title || body.Title || body.text || body.Text

  if (!rawTitle || typeof rawTitle !== 'string') {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400, headers: publicCorsHeaders }
    )
  }

  const title = rawTitle.trim()

  if (title.length === 0 || title.length > 500) {
    return NextResponse.json(
      { error: 'Title must be between 1 and 500 characters' },
      { status: 400, headers: publicCorsHeaders }
    )
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: DEMO_USER_ID,
      title,
      approved_date: null,
      completed: false,
      is_anchor: false,
      source: 'demo',
    })
    .select('id, title')
    .single()

  if (error) {
    console.error('Demo capture failed:', error)
    return NextResponse.json(
      { error: 'Failed to capture task' },
      { status: 500, headers: publicCorsHeaders }
    )
  }

  return NextResponse.json(data, {
    headers: { ...publicCorsHeaders, 'X-RateLimit-Remaining': String(remaining) }
  })
}
