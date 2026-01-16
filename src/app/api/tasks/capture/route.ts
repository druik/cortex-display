import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { USER_ID } from '@/lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.CORTEX_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', received: rawBody }, { status: 400 })
  }

  const title = body.title || body.Title || body.text || body.Text

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: USER_ID,
      title: title.trim(),
      approved_date: null,
      completed: false,
      is_anchor: false,
    })
    .select('id, title')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
