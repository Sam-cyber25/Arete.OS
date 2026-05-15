import { useLocalStorage } from './useLocalStorage'
import { format }          from 'date-fns'

/* ── Defaults ──────────────────────────────────────────────────── */
const DEFAULT_HABITS = [
  { id: '1',  name: 'Morning Prayer / Jai Shree Ram', icon: '✦', category: 'SPIRITUAL',  target: 'daily' },
  { id: '2',  name: 'Wake Up by 5:00 AM',             icon: '✦', category: 'DISCIPLINE', target: 'daily' },
  { id: '3',  name: 'Gym Session',                    icon: '✦', category: 'BODY',       target: 'mon,tue,wed,thu,fri,sat' },
  { id: '4',  name: 'MMA / Shadow Training',          icon: '✦', category: 'COMBAT',     target: 'daily' },
  { id: '5',  name: 'Drink 2L Water',                 icon: '✦', category: 'BODY',       target: 'daily' },
  { id: '6',  name: 'Eat Clean — Follow Diet',        icon: '✦', category: 'BODY',       target: 'daily' },
  { id: '7',  name: 'Read for 15+ Minutes',           icon: '✦', category: 'MIND',       target: 'daily' },
  { id: '8',  name: 'Study / Homework Done',          icon: '✦', category: 'ACADEMIC',   target: 'daily' },
  { id: '9',  name: 'Kairos Work Session',            icon: '✦', category: 'WORK',       target: 'daily' },
  { id: '10', name: 'No Junk Food',                   icon: '✦', category: 'BODY',       target: 'daily' },
  { id: '11', name: 'Journal Entry Written',          icon: '✦', category: 'MIND',       target: 'daily' },
  { id: '12', name: 'Wind Down by 10:30 PM',          icon: '✦', category: 'DISCIPLINE', target: 'daily' },
]

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const TODAY_STR = format(new Date(), 'yyyy-MM-dd')
const YESTERDAY_STR = format(new Date(Date.now() - 86_400_000), 'yyyy-MM-dd')
const TODAY_KEY = `disciplines_${TODAY_STR}` // → arete_disciplines_YYYY-MM-DD

/* ── Helpers ───────────────────────────────────────────────────── */
function isApplicable(habit, date) {
  if (habit.target === 'daily') return true
  const day = DAY_NAMES[date.getDay()]
  return habit.target.split(',').includes(day)
}

function isApplicableToday(habit) {
  return isApplicable(habit, new Date())
}

function getStoredCompletions(dateStr) {
  try {
    const raw = localStorage.getItem(`arete_disciplines_${dateStr}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

/* ── Hook ──────────────────────────────────────────────────────── */
export function useDisciplines() {
  const [habits,           setHabits]           = useLocalStorage('habits_v1', DEFAULT_HABITS)
  const [todayCompletions, setTodayCompletions] = useLocalStorage(TODAY_KEY, {})
  const [streaks,          setStreaks]           = useLocalStorage('habit_streaks', {})

  /* ── Derived ── */
  const applicableToday      = habits.filter(isApplicableToday)
  const completedTodayCount  = applicableToday.filter((h) => todayCompletions[h.id]).length
  const todayScore           = applicableToday.length > 0
    ? Math.round((completedTodayCount / applicableToday.length) * 100)
    : 0
  const isPerfectDay = applicableToday.length > 0 && completedTodayCount === applicableToday.length

  /* ── Toggle ── */
  const toggleHabit = (habitId) => {
    const wasCompleted = !!todayCompletions[habitId]
    const newCompleted = !wasCompleted

    setTodayCompletions((prev) => {
      const next = { ...prev }
      if (newCompleted) next[habitId] = true
      else              delete next[habitId]
      return next
    })

    setStreaks((prev) => {
      const ex = prev[habitId] || { current: 0, longest: 0, lastCompleted: null }
      if (newCompleted) {
        const consecutive  = ex.lastCompleted === YESTERDAY_STR || ex.lastCompleted === TODAY_STR
        const newCurrent   = consecutive ? ex.current + 1 : 1
        return {
          ...prev,
          [habitId]: {
            current:       newCurrent,
            longest:       Math.max(ex.longest, newCurrent),
            lastCompleted: TODAY_STR,
          },
        }
      } else {
        const newCurrent = Math.max(0, ex.current - 1)
        return {
          ...prev,
          [habitId]: {
            current:       newCurrent,
            longest:       ex.longest,
            lastCompleted: newCurrent > 0 ? YESTERDAY_STR : null,
          },
        }
      }
    })
  }

  /* ── CRUD ── */
  const addHabit = (habit) =>
    setHabits((prev) => [...prev, { ...habit, id: String(Date.now()), icon: '✦' }])

  const updateHabit = (id, updates) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))

  const deleteHabit = (id) =>
    setHabits((prev) => prev.filter((h) => h.id !== id))

  /* ── Analytics helpers ── */
  const getHabitStreak = (id) => {
    const s = streaks[id]
    if (!s || !s.lastCompleted) return 0
    if (s.lastCompleted === TODAY_STR || s.lastCompleted === YESTERDAY_STR) return s.current
    return 0
  }

  const getTodayScore = () => todayScore

  const getWeeklyCompletionData = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d       = new Date(Date.now() - (6 - i) * 86_400_000)
      const dateStr = format(d, 'yyyy-MM-dd')
      const comps   = dateStr === TODAY_STR ? todayCompletions : getStoredCompletions(dateStr)
      const applic  = habits.filter((h) => isApplicable(h, d))
      const done    = applic.filter((h) => comps[h.id]).length
      const score   = applic.length > 0 ? Math.round((done / applic.length) * 100) : 0
      return { date: d, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], score }
    })

  const getPerfectDays = () => {
    let count = 0
    for (let i = 0; i < 30; i++) {
      const d       = new Date(Date.now() - i * 86_400_000)
      const dateStr = format(d, 'yyyy-MM-dd')
      const comps   = dateStr === TODAY_STR ? todayCompletions : getStoredCompletions(dateStr)
      const applic  = habits.filter((h) => isApplicable(h, d))
      if (applic.length > 0 && applic.every((h) => comps[h.id])) count++
    }
    return count
  }

  return {
    habits,
    todayCompletions,
    streaks,
    applicableToday,
    completedTodayCount,
    todayScore,
    isPerfectDay,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    getHabitStreak,
    getTodayScore,
    getWeeklyCompletionData,
    getPerfectDays,
    isApplicableToday,
  }
}
