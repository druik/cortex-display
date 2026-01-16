import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID, isValidApiKey } from '@/lib/config'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { handleCors, optionsResponse, corsHeaders } from '@/lib/cors'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(request)
}

export async function POST(request: NextRequest) {
  const corsError = handleCors(request)
  if (corsError) return corsError

  const origin = request.headers.get('origin')
  const ip = getClientIp(request)
  const { allowed, remaining } = rateLimit(ip, 'tasks/capture', 20)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': '0' } }
    )
  }

  const rawBody = await request.text()

  if (!isValidApiKey(request.headers.get('x-api-key'))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders(origin) }
    )
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.error('Invalid JSON received:', rawBody)
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  const rawTitle = body.title || body.Title || body.text || body.Text

  if (!rawTitle || typeof rawTitle !== 'string') {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  const title = rawTitle.trim()

  if (title.length === 0 || title.length > 500) {
    return NextResponse.json(
      { error: 'Title must be between 1 and 500 characters' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: USER_ID,
      title,
      approved_date: null,
      completed: false,
      is_anchor: false,
    })
    .select('id, title')
    .single()

  if (error) {
    console.error('Task capture failed:', error)
    return NextResponse.json(
      { error: 'Failed to capture task' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }

  return NextResponse.json(data, {
    headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': String(remaining) }
  })
}
