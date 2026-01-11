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
      .order('created_at', { ascending: true })

    if (tasksData) {
      setTasks(tasksData)
    }

    setLoading(false)
  }

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    fetchData()

    const dataInterval = setInterval(() => {
      fetchData()
    }, 60000)

    return () => clearInterval(dataInterval)
  }, [])

  const visibleTasks = tasks.slice(0, TASK_LIMITS[capacity])

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 text-lg leading-relaxed">
      <p className="mb-8 text-2xl">{formatTime(currentTime)}</p>

      <p className="mb-8">Capacity: {formatCapacity(capacity)}</p>

      {visibleTasks.length > 0 && (
        <ul className="space-y-2">
          {visibleTasks.map((task) => (
            <li key={task.id}>• {task.title}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
