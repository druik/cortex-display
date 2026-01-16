import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { state } = await request.json()
    
    const validStates = ['low', 'moderate', 'high', 'rest']
    if (!validStates.includes(state)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    const { error } = await supabase
      .from('Capacity')
      .update({ state, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      console.error('Capacity update failed:', error)
      return NextResponse.json({ error: 'Failed to update capacity' }, { status: 500 })
    }

    return NextResponse.json({ success: true, state })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
