'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type CapacityState = 'low' | 'moderate' | 'high' | 'rest'

interface Task {
  id: string
  title: string
  due_date: string | null
}

const TASK_LIMITS: Record<CapacityState, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  rest: 0,
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatCapacity(state: CapacityState): string {
  return state.charAt(0).toUpperCase() + state.slice(1)
}

export default function CortexDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [capacity, setCapacity] = useState<CapacityState>('moderate')
  const [tasks, setTasks] = useState<Task
