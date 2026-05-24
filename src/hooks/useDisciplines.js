import { useState, useEffect, useCallback } from 'react'
import { format, subDays }                  from 'date-fns'
import { supabase }                         from '../lib/supabase'

const TODAY_STR     = format(new Date(), 'yyyy-MM-dd')
const YESTERDAY_STR = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const DAY_NAMES     = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function isApplicable(habit, date) {
  if (!habit) return false
  const target = habit.target_days || habit.target || 'daily'
  if (target === 'daily') return true
  return target.split(',').includes(DAY_NAMES[date.getDay()])
}

/*
 * DB schema: id, user_id, name, category, target_days, sort_order, created_at
 * NOTE: no `icon` column in DB — hardcoded to '✦' in UI
 */
const DEFAULT_HABITS = [
  { name: 'Morning Prayer / Jai Shree Ram', category: 'SPIRITUAL',  target_days: 'daily',                  sort_order: 0  },
  { name: 'Wake Up by 5:00 AM',             category: 'DISCIPLINE', target_days: 'daily',                  sort_order: 1  },
  { name: 'Gym Session',                    category: 'BODY',       target_days: 'mon,tue,wed,thu,fri,sat', sort_order: 2  },
  { name: 'MMA / Shadow Training',          category: 'COMBAT',     target_days: 'daily',                  sort_order: 3  },
  { name: 'Drink 2L Water',                 category: 'BODY',       target_days: 'daily',                  sort_order: 4  },
  { name: 'Eat Clean — Follow Diet',        category: 'BODY',       target_days: 'daily',                  sort_order: 5  },
  { name: 'Read for 15+ Minutes',           category: 'MIND',       target_days: 'daily',                  sort_order: 6  },
  { name: 'Study / Homework Done',          category: 'ACADEMIC',   target_days: 'daily',                  sort_order: 7  },
  { name: 'Kairos Work Session',            category: 'WORK',       target_days: 'daily',                  sort_order: 8  },
  { name: 'No Junk Food',                   category: 'BODY',       target_days: 'daily',                  sort_order: 9  },
  { name: 'Journal Entry Written',          category: 'MIND',       target_days: 'daily',                  sort_order: 10 },
  { name: 'Wind Down by 10:30 PM',          category: 'DISCIPLINE', target_days: 'daily',                  sort_order: 11 },
]

function toHabitUI(row) {
  return {
    id:       row.id,
    name:     row.name,
    icon:     '✦',               // no icon column in DB — always use default
    category: row.category,
    target:   row.target_days ?? 'daily',
  }
}

export function useDisciplines() {
  const [habits,           setHabits]          = useState([])
  const [logs,             setLogs]            = useState([])
  const [todayCompletions, setTodayCompletions] = useState({})
  const [loading,          setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([fetchHabits(), fetchLogs()])
      .finally(() => setLoading(false))
  }, [])

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from('disciplines')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error) {
      if ((data || []).length === 0) {
        await seedDefaultHabits()
      } else {
        setHabits(data.map(toHabitUI))
      }
    }
  }

  const fetchLogs = async () => {
    const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('discipline_logs')
      .select('*')
      .gte('log_date', since)
      .order('log_date', { ascending: false })
    if (!error && data) {
      setLogs(data)
      const map = {}
      data
        .filter((l) => l.log_date === TODAY_STR)
        .forEach((l) => { map[l.discipline_id] = l.completed })
      setTodayCompletions(map)
    }
  }

  const seedDefaultHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    /* Only send columns that exist in DB — no `icon` */
    const rows = DEFAULT_HABITS.map((h) => ({
      user_id:    user.id,
      name:       h.name,
      category:   h.category,
      target_days: h.target_days,
      sort_order: h.sort_order,
    }))
    const { data } = await supabase.from('disciplines').insert(rows).select()
    if (data) setHabits(data.map(toHabitUI))
  }

  /* ── Toggle a habit for today ── */
  const toggleHabit = async (habitId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const current      = !!todayCompletions[habitId]
    const newCompleted = !current

    /* Optimistic update */
    setTodayCompletions((prev) => ({ ...prev, [habitId]: newCompleted }))

    const { error } = await supabase
      .from('discipline_logs')
      .upsert(
        { user_id: user.id, discipline_id: habitId, log_date: TODAY_STR, completed: newCompleted },
        { onConflict: 'user_id,discipline_id,log_date' }
      )

    if (error) {
      /* Revert */
      setTodayCompletions((prev) => ({ ...prev, [habitId]: current }))
    } else {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.discipline_id === habitId && l.log_date === TODAY_STR)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], completed: newCompleted }
          return updated
        }
        return [...prev, { user_id: user.id, discipline_id: habitId, log_date: TODAY_STR, completed: newCompleted }]
      })
    }
  }

  /* ── CRUD ── */
  const addHabit = async (habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    const sortOrder = habits.length
    const { data, error } = await supabase
      .from('disciplines')
      .insert({
        user_id:     user.id,
        name:        habit.name || habit.title || '',
        category:    habit.category ?? '',
        target_days: habit.target   || habit.target_days || 'daily',
        sort_order:  sortOrder,
      })
      .select()
      .single()
    if (!error) setHabits((prev) => [...prev, toHabitUI(data)])
  }

  const updateHabit = async (id, updates) => {
    const dbUpdates = {}
    if ('name'     in updates) dbUpdates.name        = updates.name
    if ('category' in updates) dbUpdates.category    = updates.category
    if ('target'   in updates) dbUpdates.target_days = updates.target
    const { data, error } = await supabase
      .from('disciplines')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setHabits((prev) => prev.map((h) => h.id === id ? toHabitUI(data) : h))
  }

  const deleteHabit = async (id) => {
    const { error } = await supabase.from('disciplines').delete().eq('id', id)
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  /* ── Derived ── */
  const applicableToday     = habits.filter((h) => isApplicable(h, new Date()))
  const completedTodayCount = applicableToday.filter((h) => todayCompletions[h.id]).length
  const todayScore = applicableToday.length > 0
    ? Math.round((completedTodayCount / applicableToday.length) * 100)
    : 0
  const isPerfectDay = applicableToday.length > 0 && completedTodayCount === applicableToday.length

  /* ── Analytics from fetched logs ── */
  const getHabitStreak = useCallback((habitId) => {
    const completed = logs
      .filter((l) => l.discipline_id === habitId && l.completed)
      .map((l) => l.log_date)
      .sort()
      .reverse()
    if (!completed.length) return 0
    if (completed[0] !== TODAY_STR && completed[0] !== YESTERDAY_STR) return 0
    let streak = 1
    for (let i = 1; i < completed.length; i++) {
      const curr = new Date(completed[i - 1])
      const prev = new Date(completed[i])
      const diff = Math.round((curr - prev) / 86400000)
      if (diff === 1) streak++
      else break
    }
    return streak
  }, [logs])

  const getWeeklyCompletionData = useCallback(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d       = subDays(new Date(), 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayLogs = logs.filter((l) => l.log_date === dateStr)
      const applic  = habits.filter((h) => isApplicable(h, d))
      const done    = applic.filter((h) => dayLogs.some((l) => l.discipline_id === h.id && l.completed)).length
      const score   = applic.length > 0 ? Math.round((done / applic.length) * 100) : 0
      return { date: d, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], score }
    }),
  [logs, habits])

  const getPerfectDays = useCallback(() => {
    let count = 0
    for (let i = 0; i < 30; i++) {
      const d       = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayLogs = logs.filter((l) => l.log_date === dateStr)
      const applic  = habits.filter((h) => isApplicable(h, d))
      if (applic.length > 0 && applic.every((h) => dayLogs.some((l) => l.discipline_id === h.id && l.completed))) {
        count++
      }
    }
    return count
  }, [logs, habits])

  const getTodayScore     = () => todayScore
  const isApplicableToday = (habit) => isApplicable(habit, new Date())

  return {
    habits,
    todayCompletions,
    applicableToday,
    completedTodayCount,
    todayScore,
    isPerfectDay,
    loading,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    getHabitStreak,
    getTodayScore,
    getWeeklyCompletionData,
    getPerfectDays,
    isApplicableToday,
    refetch: () => Promise.all([fetchHabits(), fetchLogs()]),
  }
}
