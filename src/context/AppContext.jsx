import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { supabase }       from '../lib/supabase'
import { useGoals }       from '../hooks/useGoals'
import { useTasks }       from '../hooks/useTasks'
import { useNotes }       from '../hooks/useNotes'
import { useSchedule }    from '../hooks/useSchedule'
import { useJournal }     from '../hooks/useJournal'
import { useDisciplines } from '../hooks/useDisciplines'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  userName:    'Sam',
  accentColor: 'gold',
}

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [toasts,      setToasts]      = useState([])
  const [settings,    setSettings]    = useState(DEFAULT_SETTINGS)

  const goalsApi       = useGoals()
  const tasksApi       = useTasks()
  const notesApi       = useNotes()
  const scheduleApi    = useSchedule()
  const journalApi     = useJournal()
  const disciplinesApi = useDisciplines()

  /* ── Load settings from Supabase user metadata ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...user.user_metadata.settings })
      }
    })
  }, [])

  /* ── Network error → toast ── */
  useEffect(() => {
    const handler = (e) =>
      showToast(e.detail?.message || 'Connection lost — changes may not save', 'error')
    window.addEventListener('arete-db-error', handler)
    return () => window.removeEventListener('arete-db-error', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Cross-link sync: prevent re-entrant loops ── */
  const syncingRef = useRef(false)

  const toggleTaskWithSync = useCallback(async (id) => {
    if (syncingRef.current) return
    syncingRef.current = true
    try {
      const task = tasksApi.tasks.find((t) => t.id === id)
      await tasksApi.toggleTask(id)
      if (task?.goalId && task?.linkedSubtaskId) {
        const goal    = goalsApi.goals.find((g) => g.id === task.goalId)
        const subtask = goal?.subtasks?.find((st) => st.id === task.linkedSubtaskId)
        if (subtask && subtask.completed === task.completed) {
          await goalsApi.toggleSubtask(task.goalId, task.linkedSubtaskId)
        }
      }
    } finally {
      syncingRef.current = false
    }
  }, [tasksApi, goalsApi])

  const toggleSubtaskWithSync = useCallback(async (goalId, subtaskId) => {
    if (syncingRef.current) return
    syncingRef.current = true
    try {
      const goal    = goalsApi.goals.find((g) => g.id === goalId)
      const subtask = goal?.subtasks?.find((st) => st.id === subtaskId)
      await goalsApi.toggleSubtask(goalId, subtaskId)
      if (subtask?.linkedTaskId) {
        const task = tasksApi.tasks.find((t) => t.id === subtask.linkedTaskId)
        if (task && task.completed === subtask.completed) {
          await tasksApi.toggleTask(subtask.linkedTaskId)
        }
      }
    } finally {
      syncingRef.current = false
    }
  }, [goalsApi, tasksApi])

  /* ── Toasts ── */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  /* ── Settings ── */
  const updateSettings = useCallback(async (updates) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await supabase.auth.updateUser({ data: { settings: newSettings } })
  }, [settings])

  /* ── Sign out ── */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  /* ── Export data ── */
  const exportData = useCallback(() => {
    const data = {
      goals:    goalsApi.goals,
      tasks:    tasksApi.tasks,
      notes:    notesApi.notes,
      schedule: scheduleApi.events,
      journal:  journalApi.entries,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `arete-os-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported')
  }, [goalsApi.goals, tasksApi.tasks, notesApi.notes, scheduleApi.events, journalApi.entries, settings, showToast])

  /* ── Clear all data (delete from Supabase) ── */
  const clearAllData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await Promise.all([
      supabase.from('goals').delete().eq('user_id', user.id),
      supabase.from('tasks').delete().eq('user_id', user.id),
      supabase.from('notes').delete().eq('user_id', user.id),
      supabase.from('disciplines').delete().eq('user_id', user.id),
      supabase.from('discipline_logs').delete().eq('user_id', user.id),
      supabase.from('journal_entries').delete().eq('user_id', user.id),
      supabase.from('schedule_events').delete().eq('user_id', user.id),
      supabase.from('books').delete().eq('user_id', user.id),
      supabase.from('body_stats').delete().eq('user_id', user.id),
      supabase.from('sticky_notes').delete().eq('user_id', user.id),
      supabase.from('planner_entries').delete().eq('user_id', user.id),
    ])
    window.location.reload()
  }, [])

  /* Derive streak from journal entries — used by dashboard widgets */
  const streak = { count: journalApi.journalStreak, lastDate: new Date().toISOString() }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        toasts,
        showToast,
        dismissToast,
        settings,
        updateSettings,
        streak,
        signOut,
        exportData,
        clearAllData,
        ...goalsApi,
        ...tasksApi,
        /* synced cross-link overrides */
        toggleTask:    toggleTaskWithSync,
        toggleSubtask: toggleSubtaskWithSync,
        ...notesApi,
        events:      scheduleApi.events,
        addEvent:    scheduleApi.addEvent,
        updateEvent: scheduleApi.updateEvent,
        deleteEvent: scheduleApi.deleteEvent,
        /* journal — only streak exposed; page uses useJournal() directly */
        journalStreak: journalApi.journalStreak,
        ...disciplinesApi,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
