import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { format, subDays }     from 'date-fns'

export const PROTEIN_GOAL = 120

const EMPTY_DAY = { weight: null, protein: 0, feel: null, gymDone: false, notes: '' }

function toUI(row) {
  return {
    id:      row.id,
    date:    row.stat_date,
    weight:  row.weight   ?? null,
    protein: row.protein  ?? 0,
    feel:    row.feel     ?? null,
    gymDone: row.gym_done ?? false,
    notes:   row.notes    ?? '',
  }
}

export function useCorpus() {
  const [allEntries, setAllEntries] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('body_stats')
      .select('*')
      .gte('stat_date', since)
      .order('stat_date', { ascending: false })
    if (!error) {
      const rows = data || []
      if (rows.length === 0) {
        await seedDefaultStats()
      } else {
        setAllEntries(rows.map(toUI))
      }
    }
    setLoading(false)
  }

  const seedDefaultStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date()
    const WEIGHTS  = [68.2, 68.5, 68.3, 68.8, 68.6, 69.0, 68.7]
    const PROTEINS = [95, 112, 88, 130, 105, 78, 122]
    const FEELS    = [3, 4, 2, 4, 3, 2, 4]
    const rows = []
    for (let i = 6; i >= 0; i--) {
      const idx      = 6 - i
      const statDate = format(subDays(today, i), 'yyyy-MM-dd')
      rows.push({
        user_id:   user.id,
        stat_date: statDate,
        weight:    WEIGHTS[idx],
        protein:   PROTEINS[idx],
        feel:      FEELS[idx],
        gym_done:  PROTEINS[idx] >= 100,
        notes:     '',
      })
    }
    const { data } = await supabase.from('body_stats').insert(rows).select()
    if (data) setAllEntries(data.map(toUI))
  }

  /* ── Today's entry ── */
  const todayKey   = format(new Date(), 'yyyy-MM-dd')
  const todayEntry = allEntries.find((e) => e.date === todayKey) || { ...EMPTY_DAY, date: todayKey }

  const updateToday = async (updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const dbRow = {
      user_id:   user.id,
      stat_date: todayKey,
    }
    if ('weight'  in updates) dbRow.weight   = updates.weight
    if ('protein' in updates) dbRow.protein  = updates.protein
    if ('feel'    in updates) dbRow.feel     = updates.feel
    if ('gymDone' in updates) dbRow.gym_done = updates.gymDone
    if ('notes'   in updates) dbRow.notes    = updates.notes

    const { data, error } = await supabase
      .from('body_stats')
      .upsert(dbRow, { onConflict: 'user_id,stat_date' })
      .select()
      .single()
    if (!error && data) {
      const ui = toUI(data)
      setAllEntries((prev) => {
        const idx = prev.findIndex((e) => e.date === todayKey)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = ui
          return updated
        }
        return [ui, ...prev]
      })
    }
  }

  const addProtein = (grams) => {
    const current = todayEntry.protein || 0
    updateToday({ protein: Math.max(0, current + grams) })
  }

  /* ── Read N days from in-memory state ── */
  const getLastNDays = (n = 30) =>
    Array.from({ length: n }, (_, i) => {
      const d     = subDays(new Date(), n - 1 - i)
      const date  = format(d, 'yyyy-MM-dd')
      const entry = allEntries.find((e) => e.date === date)
      return { date, label: format(d, 'MMM d'), ...(entry || { ...EMPTY_DAY }) }
    })

  /* ── Derived stats ── */
  const computeStats = () => {
    const days    = getLastNDays(30)
    const last7   = days.slice(-7).filter((d) => d.protein > 0)
    const withW   = days.filter((d) => d.weight !== null)
    const hitGoal = days.filter((d) => d.protein >= PROTEIN_GOAL)

    let maxStreak = 0, cur = 0
    for (const d of days) {
      if (d.protein >= PROTEIN_GOAL) { cur++; maxStreak = Math.max(maxStreak, cur) }
      else cur = 0
    }

    return {
      currentWeight:  withW.length ? withW[withW.length - 1].weight : null,
      avgProtein7d:   last7.length ? Math.round(last7.reduce((s, d) => s + d.protein, 0) / last7.length) : 0,
      daysHitGoal:    hitGoal.length,
      consistencyPct: Math.round((hitGoal.length / days.length) * 100),
      longestStreak:  maxStreak,
    }
  }

  return {
    todayEntry,
    loading,
    updateToday,
    addProtein,
    getLastNDays,
    computeStats,
    PROTEIN_GOAL,
    refetch: fetchEntries,
  }
}
