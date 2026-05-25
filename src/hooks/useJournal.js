import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { startOfDay }          from 'date-fns'

export function useJournal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })

    if (!error) setEntries(data || [])
    setLoading(false)
  }

  const saveEntry = async ({ date, victories, lessons, tomorrow, reflection, intensity }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(
        {
          user_id:    user.id,
          entry_date: date,
          victories:  victories  || '',
          lessons:    lessons    || '',
          tomorrow:   tomorrow   || '',
          reflection: reflection || '',
          intensity:  intensity  || 3,
        },
        { onConflict: 'user_id,entry_date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Journal save error:', error)
      return false
    }

    /* Update local state directly — no full refetch, no re-render cascade */
    setEntries((prev) => {
      const exists = prev.find((e) => e.entry_date === date)
      if (exists) return prev.map((e) => e.entry_date === date ? data : e)
      return [data, ...prev]
    })

    return true
  }

  const deleteEntry = async (entryDate) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('entry_date', entryDate)

    if (!error) setEntries((prev) => prev.filter((e) => e.entry_date !== entryDate))
  }

  const getTodayEntry = () => {
    const today = new Date().toISOString().slice(0, 10)
    return entries.find((e) => e.entry_date === today) || null
  }

  /* ── Streak — consecutive days with an entry ── */
  const journalStreak = (() => {
    if (!entries.length) return 0
    const dates = entries
      .map((e) => startOfDay(new Date(e.entry_date + 'T12:00:00')).getTime())
      .sort((a, b) => b - a)
    const msPerDay = 86400000
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      if (dates[i - 1] - dates[i] === msPerDay) streak++
      else break
    }
    return streak
  })()

  return { entries, loading, saveEntry, deleteEntry, getTodayEntry, journalStreak, refetch: fetchEntries }
}
