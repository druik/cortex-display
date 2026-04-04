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
  const { allowed, remaining } = rateLimit(ip, 'reminders/sync', 10)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': '0' } }
    )
  }

  if (!isValidApiKey(request.headers.get('x-api-key'))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders(origin) }
    )
  }

  const rawBody = await request.text()
  console.log('[reminders/sync] raw body:', rawBody)

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.log('[reminders/sync] JSON parse failed')
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  console.log('[reminders/sync] parsed body keys:', Object.keys(body), 'reminders type:', typeof body.reminders)

  const { list } = body
  let reminders = body.reminders

  if (typeof reminders === 'string') {
    try {
      reminders = JSON.parse(reminders)
    } catch {
      return NextResponse.json(
        { error: 'reminders string is not valid JSON' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }
  }

  if (!Array.isArray(reminders)) {
    reminders = reminders ? [reminders] : []
  }

  if (reminders.length === 0) {
    return NextResponse.json(
      { error: 'reminders array is required and must not be empty' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  const syncTimestamp = new Date().toISOString()
  const listName = list || 'Cortex'

  const rows = reminders
    .filter((r: { title?: string; external_id?: string }) => r.title && r.external_id)
    .map((r: {
      external_id: string
      title: string
      notes?: string
      due_at?: string
      completed?: boolean
      completed_at?: string
      priority?: number
    }) => ({
      user_id: USER_ID,
      external_id: r.external_id,
      list_name: listName,
      title: r.title.trim(),
      notes: r.notes || null,
      due_at: r.due_at || null,
      completed: r.completed || false,
      completed_at: r.completed_at || null,
      priority: r.priority || 0,
      last_seen_at: syncTimestamp,
    }))

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'No valid reminders (each must have external_id and title)' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  const { error: upsertError } = await supabase
    .from('reminders')
    .upsert(rows, { onConflict: 'external_id,user_id' })

  if (upsertError) {
    console.error('Reminders sync upsert failed:', upsertError)
    return NextResponse.json(
      { error: 'Failed to sync reminders' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }

  const { error: cleanupError } = await supabase
    .from('reminders')
    .delete()
    .eq('user_id', USER_ID)
    .eq('list_name', listName)
    .lt('last_seen_at', syncTimestamp)

  if (cleanupError) {
    console.error('Reminders cleanup failed:', cleanupError)
  }

  return NextResponse.json(
    { success: true, synced: rows.length },
    { headers: { ...corsHeaders(origin), 'X-RateLimit-Remaining': String(remaining) } }
  )
}
