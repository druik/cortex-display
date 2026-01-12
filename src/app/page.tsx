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
  low: 3,
  moderate: 5,
  high: 7,
  rest: 1,
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    const { data: capacityData } = await supabase
      .from('Capacity')
      .select('state')
      .eq('id', 1)
      .single()

    if (capacityData) {
      setCapacity(capacityData.state as CapacityState)
    }

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('completed', false)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (tasksData) {
      setTasks(tasksData)
    }

    setLoading(false)
  }

  async function completeTask(id: string) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date
