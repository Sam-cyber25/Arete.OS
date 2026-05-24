import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { addDays, startOfWeek } from 'date-fns'

/*
 * Category IDs used throughout the schedule system.
 * Maps to display colors in SchedulePage / EventBlock.
 */
export const CAT_COLORS = {
  pers:    '#8A7A65',   // warm brown
  gym:     '#4A6741',   // forest green
  study:   '#5C7A8A',   // muted blue-grey
  diet:    '#7A5C3A',   // warm amber
  mma:     '#8B3A3A',   // deep crimson
  work:    '#C9A84C',   // gold
  growth:  '#6B5F7A',   // muted purple-grey
  other:   '#4A3F32',   // faint
}

export const CAT_LABELS = {
  pers:    '[PERS]',
  gym:     '[GYM]',
  study:   '[STUDY]',
  diet:    '[DIET]',
  mma:     '[MMA]',
  work:    '[WORK]',
  growth:  '[GRWTH]',
  other:   '[—]',
  // legacy aliases
  personal: '[PERS]',
}

/* ── Sam's complete weekly routine ─────────────────────────────
 * dayMask values: 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
 */
function buildDefaultEvents() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const events = []
  let uid = 1

  const add = (dayIdx, h, m, title, cat, dur) => {
    const date = new Date(days[dayIdx])
    date.setHours(h, m, 0, 0)
    events.push({
      id:        `ev_${uid++}`,
      title,
      category:  cat,
      startTime: date.toISOString(),
      duration:  dur,
      recurring: 'weekly',
    })
  }

  /* ── SCHOOL DAYS: Mon(0) Tue(1) Wed(2) Thu(3) Fri(4) Sat(5) ─ */
  const SCHOOL     = [0, 1, 2, 3, 4, 5]
  const NON_FRENCH = [0, 2, 3, 5]
  const FRENCH     = [1, 4]
  const SUN        = [6]

  SCHOOL.forEach((d) => {
    add(d,  5,  0, 'Wake Up',                   'pers',   5)
    add(d,  5,  5, 'Pre-Workout Fuel',           'diet',  10)
    add(d,  6, 20, 'Bath + Get Ready',           'pers',  25)
    add(d,  6, 45, 'Post-Workout Breakfast',     'diet',  35)
    add(d,  7, 20, 'Leave for School',           'study',  5)
    add(d,  7, 25, 'School',                     'study', 300)
    add(d, 13, 15, 'Home + Freshen Up',          'pers',  15)
    add(d, 13, 30, 'Lunch',                      'diet',  30)
    add(d, 14,  0, 'Homework',                   'study', 60)
    add(d, 15,  0, 'Break + Reading',            'growth', 15)
    add(d, 15, 15, 'MMA Shadow Training',        'mma',   30)
    add(d, 15, 45, 'Snack',                      'diet',  15)
    add(d, 16,  0, 'Kairos Skills Work',         'work',  50)
    add(d, 16, 50, 'Revise Before Class',        'study', 10)
    add(d, 17,  0, 'Next Toppers — Class 1',     'study', 75)
    add(d, 20,  0, 'Next Toppers — Class 2',     'study', 75)
    add(d, 21, 20, 'Dinner',                     'diet',  25)
    add(d, 23,  0, 'Sleep',                      'pers', 420)
  })

  add(0,  5, 15, 'Gym — Chest + Triceps',     'gym',  65)
  add(2,  5, 15, 'Gym — Shoulders + Abs',     'gym',  65)
  add(3,  5, 15, 'Gym — Legs + Cardio',       'gym',  65)
  add(5,  5, 15, 'Gym — Arms + Abs + Cardio', 'gym',  65)

  NON_FRENCH.forEach((d) => {
    add(d, 18, 15, 'Break',                      'pers', 105)
    add(d, 21, 45, 'Next Toppers — Homework',    'study', 45)
    add(d, 22, 30, 'Wind Down',                  'pers',  30)
  })

  FRENCH.forEach((d) => {
    add(d, 18, 15, 'French Class',               'study', 95)
    add(d, 19, 50, 'Break',                      'pers',  10)
    add(d, 21, 45, 'Tutor Sir',                  'study', 60)
    add(d, 22, 45, 'Wind Down',                  'pers',  15)
  })

  SUN.forEach((d) => {
    add(d,  7,  0, 'Wake Up — Rest Day',          'pers',  30)
    add(d,  7, 30, 'Morning Walk',                'gym',   40)
    add(d,  8, 15, 'Breakfast',                   'diet',  30)
    add(d,  9,  0, 'Reading',                     'growth', 60)
    add(d, 10,  0, 'Kairos Deep Work',            'work',  180)
    add(d, 13,  0, 'Lunch',                       'diet',  30)
    add(d, 14,  0, 'Study + Revision',            'study', 120)
    add(d, 15, 45, 'Snack',                       'diet',  15)
    add(d, 16,  0, 'Free Time — Minecraft / Rest','pers',  150)
    add(d, 18, 30, 'Full Body Stretch',           'gym',   20)
    add(d, 20,  0, 'Dinner',                      'diet',  30)
    add(d, 21,  0, 'Week Prep',                   'pers',  60)
    add(d, 22,  0, 'Sleep',                       'pers',  480)
  })

  return events
}

function toUI(row) {
  return {
    id:        row.id,
    title:     row.title,
    category:  row.category,
    startTime: row.start_time,
    duration:  row.duration,
    recurring: row.recurring ?? 'none',
  }
}

export function useSchedule() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .order('start_time', { ascending: true })
    if (!error) {
      if ((data || []).length === 0) {
        await seedDefaultEvents()
      } else {
        setEvents(data.map(toUI))
      }
    }
    setLoading(false)
  }

  const seedDefaultEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const defaults = buildDefaultEvents()
    /* Do NOT send id — let Supabase auto-generate UUIDs */
    const rows = defaults.map((e) => ({
      user_id:    user.id,
      title:      e.title,
      category:   e.category,
      start_time: e.startTime,
      duration:   e.duration,
      recurring:  e.recurring,
    }))
    const { data } = await supabase.from('schedule_events').insert(rows).select()
    if (data) setEvents(data.map(toUI))
  }

  const addEvent = async (event) => {
    const { data: { user } } = await supabase.auth.getUser()
    /* Do NOT send id — let Supabase auto-generate */
    const { data, error } = await supabase
      .from('schedule_events')
      .insert({
        user_id:    user.id,
        title:      event.title,
        category:   event.category,
        start_time: event.startTime,
        duration:   event.duration,
        recurring:  event.recurring ?? 'none',
      })
      .select()
      .single()
    if (!error) setEvents((prev) => [...prev, toUI(data)])
  }

  const updateEvent = async (id, updates) => {
    const dbUpdates = {}
    if ('title'     in updates) dbUpdates.title      = updates.title
    if ('category'  in updates) dbUpdates.category   = updates.category
    if ('startTime' in updates) dbUpdates.start_time = updates.startTime
    if ('duration'  in updates) dbUpdates.duration   = updates.duration
    if ('recurring' in updates) dbUpdates.recurring  = updates.recurring
    const { data, error } = await supabase
      .from('schedule_events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setEvents((prev) => prev.map((e) => e.id === id ? toUI(data) : e))
  }

  const deleteEvent = async (id) => {
    const { error } = await supabase.from('schedule_events').delete().eq('id', id)
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, loading, addEvent, updateEvent, deleteEvent, refetch: fetchEvents }
}
