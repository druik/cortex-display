import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isValidApiKey } from '@/lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const isSameOrigin = origin?.includes('localhost') || referer?.includes('localhost')

  if (!isSameOrigin) {
    if (!isValidApiKey(request.headers.get('x-api-key'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const { id, action } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    if (action === 'toggle_anchor') {
      const { data: task } = await supabase
        .from('tasks')
        .select('is_anchor')
        .eq('id', id)
        .single()

      const { error } = await supabase
        .from('tasks')
        .update({ is_anchor: !task?.is_anchor })
        .eq('id', id)

      if (error) {
        console.error('Toggle anchor failed:', error)
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
      }

      return NextResponse.json({ success: true, is_anchor: !task?.is_anchor })
    }

    if (action === 'undo') {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: false, completed_at: null })
        .eq('id', id)

      if (error) {
        console.error('Undo task failed:', error)
        return NextResponse.json({ error: 'Failed to undo task' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Default: complete task
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Complete task failed:', error)
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
