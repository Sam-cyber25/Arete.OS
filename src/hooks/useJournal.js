import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { format, startOfDay }  from 'date-fns'

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

/* Add a `date` alias to any raw Supabase row so components use e.date */
function normalize(row) {
  return { ...row, date: row.entry_date }
}

function emptyEntry(date) {
  return {
    id:         date,
    date,
    entry_date: date,
    intensity:  null,
    victories:  '',
    lessons:    '',
    tomorrow:   '',
    reflection: '',
    createdAt:  new Date().toISOString(),
  }
}

export function useJournal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEntries() }, [])

  /* ── Fetch ── */
  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })
    if (!error) {
      /* Normalize: add `date` alias so components work with e.date */
      setEntries((data || []).map(normalize))
    }
    setLoading(false)
  }

  const today = todayKey()
  const todayEntry = entries.find((e) => e.date === today) || emptyEntry(today)

  /* ── Upsert ── */
  const upsertEntry = async (entryData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(
        {
          user_id:    user.id,
          entry_date: entryData.date,     // map date → entry_date
          victories:  entryData.victories  || '',
          lessons:    entryData.lessons    || '',
          tomorrow:   entryData.tomorrow   || '',
          reflection: entryData.reflection || '',
          intensity:  entryData.intensity  || 3,
        },
        { onConflict: 'user_id,entry_date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Journal upsert error:', error)
      return false
    }

    /* Normalize returned row and update state */
    const normalized = normalize(data)
    setEntries((prev) => {
      const exists = prev.find((e) => e.date === entryData.date)
      if (exists) return prev.map((e) => e.date === entryData.date ? normalized : e)
      return [normalized, ...prev]
    })
    return true
  }

  /* ── Delete ── */
  const deleteEntry = async (date) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('entry_date', date)           // use DB column name
    if (!error) setEntries((prev) => prev.filter((e) => e.date !== date))
  }

  /* Past entries sorted newest-first, excluding today */
  const pastEntries = [...entries]
    .filter((e) => e.date !== today)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  /* Streak — consecutive days with an entry */
  const journalStreak = (() => {
    if (!entries.length) return 0
    const dates = entries
      .map((e) => startOfDay(new Date(e.date + 'T12:00:00')).getTime())
      .sort((a, b) => b - a)
    const msPerDay = 86400000
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      if (dates[i - 1] - dates[i] === msPerDay) streak++
      else break
    }
    return streak
  })()

  return {
    entries,
    loading,
    todayEntry,
    upsertEntry,
    deleteEntry,
    pastEntries,
    journalStreak,
    refetch: fetchEntries,
  }
}
