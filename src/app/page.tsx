'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white/40 text-4xl">Loading</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-16 py-20 bg-black">
      <p className="text-[12vw] font-extralight tracking-tight text-white leading-none mb-12">{formatTime(currentTime)}</p>
      <p className="text-[4vw] text-white/40 mb-16">{formatCapacity(capacity)}</p>
      {visibleTasks.length > 0 && (
        <ul className="space-y-6">
          {visibleTasks.map((task) => (
            <li key={task.id} className="text-[3vw] text-white/70">{task.title}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
