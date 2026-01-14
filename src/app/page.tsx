'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type CapacityState = 'low' | 'moderate' | 'high' | 'rest'

interface Task {
  id: string
  title: string
  due_date: string | null
  is_anchor: boolean
}

interface CalendarEvent {
  title: string
  start_at: string
  provider: string
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

function formatEventTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRelativeTime(eventDate: Date, now: Date): string {
  const diffMs = eventDate.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `in ${diffMins}m`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`
}

export default function CortexDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [capacity, setCapacity] = useState<CapacityState>('moderate')
  const [tasks, setTasks] = useState<Task[]>([])
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  async function fetchData() {
    const { data: capacityData } = await supabase
      .from('Capacity')
      .select('state')
      .eq('id', 1)
      .single()

    if (capacityData) {
      setCapacity(capacityData.state as CapacityState)
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, due_date, is_anchor')
      .eq('completed', false)
      .eq('approved_date', today)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (tasksData) {
      setTasks(tasksData)
    }

    const eventRes = await fetch('/api/calendar/next')
    const eventData = await eventRes.json()
    setNextEvent(eventData.event || null)

    setLoading(false)
  }

  async function completeTask(task: Task) {
    if (isLongPress.current) return
    
    setTasks(prev => prev.filter(t => t.id !== task.id))
    setUndoTask(task)
    
    if (undoTimeout) clearTimeout(undoTimeout)
    
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

  async function toggleAnchor(task: Task) {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, action: 'toggle_anchor' }),
    })
    const data = await res.json()
    
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, is_anchor: data.is_anchor } : t
    ))
    
    setToast(data.is_anchor ? `Pinned: ${task.title}` : `Unpinned: ${task.title}`)
    setTimeout(() => setToast(null), 2000)
  }

  function handlePressStart(task: Task) {
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      toggleAnchor(task)
    }, 500)
  }

  function handlePressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
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

  const anchors = tasks.filter(t => t.is_anchor)
  const regularTasks = tasks.filter(t => !t.is_anchor)
  const visibleTasks = regularTasks.slice(0, TASK_LIMITS[capacity])

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

      {/* Next Calendar Event */}
      {nextEvent && (
        <div className="mb-16">
          <p className="text-[2.5vw] text-white/60">
            {formatEventTime(new Date(nextEvent.start_at))}  {nextEvent.title}
          </p>
          <p className="text-[1.5vw] text-white/30 mt-2">
            {formatRelativeTime(new Date(nextEvent.start_at), currentTime)}
          </p>
        </div>
      )}

      {/* Anchored Tasks */}
      {anchors.length > 0 && (
        <ul className="space-y-6 mb-12">
          {anchors.map((task) => (
            <li
              key={task.id}
              onClick={() => completeTask(task)}
              onMouseDown={() => handlePressStart(task)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(task)}
              onTouchEnd={handlePressEnd}
              className="text-[3vw] text-white cursor-pointer hover:text-white/60 active:text-white/40 transition-opacity select-none"
            >
              📌 {task.title}
            </li>
          ))}
        </ul>
      )}

      {/* Regular Tasks */}
      {visibleTasks.length > 0 && (
        <ul className="space-y-6">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              onClick={() => completeTask(task)}
              onMouseDown={() => handlePressStart(task)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(task)}
              onTouchEnd={handlePressEnd}
              className="text-[3vw] text-white/70 cursor-pointer hover:text-white/40 active:text-white/20 transition-opacity select-none"
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

      {/* Pin Toast */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-8 py-4 rounded-full">
          <span className="text-white/70 text-xl">{toast}</span>
        </div>
      )}
    </main>
  )
}
