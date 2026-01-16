import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID, isValidApiKey } from '@/lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!isValidApiKey(request.headers.get('x-api-key'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.error('Invalid JSON received:', rawBody)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawTitle = body.title || body.Title || body.text || body.Text

  if (!rawTitle || typeof rawTitle !== 'string') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const title = rawTitle.trim()

  if (title.length === 0 || title.length > 500) {
    return NextResponse.json({ error: 'Title must be between 1 and 500 characters' }, { status: 400 })
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
    return NextResponse.json({ error: 'Failed to capture task' }, { status: 500 })
  }

  return NextResponse.json(data)
}
