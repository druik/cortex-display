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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
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
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)

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

  async function completeTask(task: Task) {
    // Optimistically remove from UI
    setTasks(prev => prev.filter(t => t.id !== task.id))
    
    // Show undo toast
    setUndoTask(task)
    
    // Clear any existing timeout
    if (undoTimeout) clearTimeout(undoTimeout)
    
    // Set new timeout to actually complete after 5 seconds
    const timeout = setTimeout(async () => {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id }),
      })
      setUndoTask(null)
    }, 5000)
    
    setUndoTimeout(timeout)
  }

  function undoComplete() {
    if (undoTask && undoTimeout) {
      clearTimeout(undoTimeout)
      setTasks(prev => [...prev, undoTask].sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }))
      setUndoTask(null)
      setUndoTimeout(null)
    }
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
      <p className="text-[12vw] font-extralight tracking-tight text-white leading-none mb-2">
        {formatTime(currentTime)}
      </p>
      <p className="text-[3vw] text-white/50 mb-12">
        {formatDate(currentTime)}
      </p>
      <p className="text-[2vw] text-white/30 mb-16">{formatCapacity(capacity)}</p>
      
      {visibleTasks.length > 0 && (
        <ul className="space-y-6">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              onClick={() => completeTask(task)}
              className="text-[3vw] text-white/70 cursor-pointer hover:text-white/40 active:text-white/20 transition-opacity"
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}

      {/* Undo Toast */}
      {undoTask && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-8 py-4 rounded-full flex items-center gap-6">
          <span className="text-white/70 text-xl">Completed: {undoTask.title}</span>
          <button
            onClick={undoComplete}
            className="text-white font-medium text-xl hover:text-white/70 transition-colors"
          >
            Undo
          </button>
        </div>
      )}
    </main>
  )
}
