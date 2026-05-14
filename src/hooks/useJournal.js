import { useLocalStorage } from './useLocalStorage'
import { format, isToday, startOfDay } from 'date-fns'

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

function emptyEntry(date) {
  return {
    id: date,
    date,
    intensity: null,
    victories: '',
    lessons: '',
    tomorrow: '',
    reflection: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function useJournal() {
  const [entries, setEntries] = useLocalStorage('journal', [])

  const today = todayKey()

  const todayEntry = entries.find((e) => e.date === today) || emptyEntry(today)

  const upsertEntry = (updates) => {
    const now = new Date().toISOString()
    setEntries((prev) => {
      const exists = prev.find((e) => e.date === today)
      if (exists) {
        return prev.map((e) =>
          e.date === today ? { ...e, ...updates, updatedAt: now } : e
        )
      } else {
        return [{ ...emptyEntry(today), ...updates, updatedAt: now }, ...prev]
      }
    })
  }

  const deleteEntry = (date) =>
    setEntries((prev) => prev.filter((e) => e.date !== date))

  const pastEntries = entries.filter((e) => e.date !== today)

  const journalStreak = (() => {
    if (!entries.length) return 0
    const dates = entries.map((e) => startOfDay(new Date(e.date)).getTime()).sort((a, b) => b - a)
    const msPerDay = 86400000
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      if (dates[i - 1] - dates[i] === msPerDay) streak++
      else break
    }
    return streak
  })()

  return { entries, todayEntry, upsertEntry, deleteEntry, pastEntries, journalStreak }
}
