import { createContext, useContext, useState, useCallback } from 'react'
import { useGoals }       from '../hooks/useGoals'
import { useTasks }       from '../hooks/useTasks'
import { useNotes }       from '../hooks/useNotes'
import { useSchedule }    from '../hooks/useSchedule'
import { useJournal }     from '../hooks/useJournal'
import { useDisciplines } from '../hooks/useDisciplines'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  userName:    'Sam',
  accentColor: 'gold',
}

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage]     = useState('dashboard')
  const [toasts, setToasts]               = useState([])
  const [settings, setSettings]           = useLocalStorage('settings', DEFAULT_SETTINGS)
  const [streak, setStreak]               = useLocalStorage('streak',   { count: 1, lastDate: new Date().toISOString() })

  const goalsApi       = useGoals()
  const tasksApi       = useTasks()
  const notesApi       = useNotes()
  const scheduleApi    = useSchedule()
  const journalApi     = useJournal()
  const disciplinesApi = useDisciplines()

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const updateSettings = useCallback((updates) => setSettings((prev) => ({ ...prev, ...updates })), [setSettings])

  const exportData = useCallback(() => {
    const data = {
      goals:    goalsApi.goals,
      tasks:    tasksApi.tasks,
      notes:    notesApi.notes,
      schedule: scheduleApi.events,
      journal:  journalApi.entries,
      settings,
      streak,
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
  }, [goalsApi.goals, tasksApi.tasks, notesApi.notes, scheduleApi.events, journalApi.entries, settings, streak, showToast])

  const clearAllData = useCallback(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('arete_'))
      .forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }, [])

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
        exportData,
        clearAllData,
        ...goalsApi,
        ...tasksApi,
        ...notesApi,
        events:      scheduleApi.events,
        addEvent:    scheduleApi.addEvent,
        updateEvent: scheduleApi.updateEvent,
        deleteEvent: scheduleApi.deleteEvent,
        ...journalApi,
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
