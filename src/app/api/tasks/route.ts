import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function PATCH(request: NextRequest) {
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
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, is_anchor: !task?.is_anchor })
    }

    if (action === 'undo') {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: false, completed_at: null })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Default: complete task
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
