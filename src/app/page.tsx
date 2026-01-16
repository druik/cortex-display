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

interface CompletedTask {
  id: string
  title: string
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

function isFlexEvent(title: string): boolean {
  return title.toLowerCase().startsWith('[flex]')
}

function stripFlexPrefix(title: string): string {
  return title.replace(/^\[flex\]\s*/i, '')
}

export default function CortexDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [capacity, setCapacity] = useState<CapacityState>('moderate')
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastExiting, setToastExiting] = useState(false)
  const [completedToday, setCompletedToday] = useState<CompletedTask[]>([])
  const [completedExpanded, setCompletedExpanded] = useState(false)
  const [showFlexEvents, setShowFlexEvents] = useState(false)
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

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, due_date, is_anchor')
      .eq('completed', false)
      .lte('approved_date', today)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (tasksData) {
      setTasks(tasksData)
    }

    const eventRes = await fetch('/api/calendar/next')
    const eventData = await eventRes.json()
    setEvents(eventData.events || [])
    setShowFlexEvents(false)

    const todayPacific = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
    const { data: completedData } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('completed', true)
      .gte('completed_at', `${todayPacific}T00:00:00`)
      .order('completed_at', { ascending: false })

    if (completedData) {
      setCompletedToday(completedData)
    }

    setLoading(false)
  }

  async function completeTask(task: Task) {
    if (isLongPress.current) return

    setTasks(prev => prev.filter(t => t.id !== task.id))
    setUndoTask(task)
    setToastExiting(false)

    if (undoTimeout) clearTimeout(undoTimeout)

    const timeout = setTimeout(async () => {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id }),
      })
      setCompletedToday(prev => [{ id: task.id, title: task.title }, ...prev])
      setToastExiting(true)
      setTimeout(() => {
        setUndoTask(null)
        setToastExiting(false)
      }, 200)
    }, 5000)

    setUndoTimeout(timeout)
  }

  async function undoComplete() {
    if (!undoTask) return

    if (undoTimeout) clearTimeout(undoTimeout)

    setTasks(prev => [...prev, undoTask].sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }))

    setCompletedToday(prev => prev.filter(t => t.id !== undoTask.id))

    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: undoTask.id, action: 'undo' }),
    })

    setUndoTask(null)
    setUndoTimeout(null)
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
    // Update clock every 30 seconds
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)

    // Fetch data on mount and every 30 seconds
    fetchData()
    const dataInterval = setInterval(fetchData, 30000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
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

      {/* Calendar Events */}
      {events.length > 0 && (() => {
        const isLowCapacity = capacity === 'low' || capacity === 'rest'
        const visibleEvents = isLowCapacity && !showFlexEvents
          ? events.filter(e => !isFlexEvent(e.title))
          : events
        const hiddenCount = events.length - visibleEvents.length

        return (
          <div className="mb-16 space-y-6">
            {visibleEvents.map((event, index) => {
              const isFlex = isFlexEvent(event.title)
              const displayTitle = isFlex ? stripFlexPrefix(event.title) : event.title
              const dimmed = isFlex && isLowCapacity && showFlexEvents

              return (
                <div
                  key={`${event.start_at}-${index}`}
                  className={`pl-6 border-l-2 ${dimmed ? 'border-sky-500/20' : 'border-sky-500/40'}`}
                >
                  <p className={`text-[2.5vw] ${dimmed ? 'text-sky-100/40' : 'text-sky-100/80'}`}>
                    {formatEventTime(new Date(event.start_at))}
                    <span className="text-white/50 mx-3">·</span>
                    {displayTitle}
                  </p>
                  {index === 0 && (
                    <p className={`text-[1.8vw] mt-2 font-medium ${dimmed ? 'text-sky-400/30' : 'text-sky-400/60'}`}>
                      {formatRelativeTime(new Date(event.start_at), currentTime)}
                    </p>
                  )}
                </div>
              )
            })}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowFlexEvents(true)}
                className="text-[1.8vw] text-white/20 hover:text-white/40 transition-colors select-none"
              >
                {hiddenCount} hidden ▶
              </button>
            )}
          </div>
        )
      })()}

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

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="mt-20">
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="text-[1.8vw] text-white/25 hover:text-white/40 transition-colors select-none"
          >
            {completedToday.length} completed {completedExpanded ? '▼' : '▶'}
          </button>
          {completedExpanded && (
            <ul className="mt-4 space-y-3">
              {completedToday.map((task) => (
                <li
                  key={task.id}
                  className="text-[1.8vw] text-white/20 line-through"
                >
                  {task.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Undo Toast */}
      {undoTask && (
        <div className={`fixed bottom-20 left-1/2 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden ${toastExiting ? 'toast-exit' : 'toast-enter'}`}>
          <div className="px-10 py-5 flex items-center gap-8">
            <span className="text-[2.5vw] text-white/70">{undoTask.title}</span>
            <button
              onClick={undoComplete}
              className="text-[2.5vw] text-white/50 font-medium hover:text-white transition-colors px-6 py-3 -my-3 -mr-6 min-h-[60px]"
            >
              Undo
            </button>
          </div>
          <div key={undoTask.id} className="h-1.5 bg-white/20 toast-progress" />
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
