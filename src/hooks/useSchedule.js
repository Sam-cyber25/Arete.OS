import { useLocalStorage } from './useLocalStorage'
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

/* ── Sam's complete weekly routine ────────────────────────────
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
  const SCHOOL = [0, 1, 2, 3, 4, 5]

  /* ── Non-French evenings: Mon Wed Thu Sat ─── */
  const NON_FRENCH = [0, 2, 3, 5]

  /* ── French + Tutor evenings: Tue Fri ─────── */
  const FRENCH = [1, 4]

  /* ── Sunday ──────────────────────────────── */
  const SUN = [6]

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

  /* Gym sessions on their respective days */
  add(0,  5, 15, 'Gym — Chest + Triceps',     'gym',  65)
  add(2,  5, 15, 'Gym — Shoulders + Abs',     'gym',  65)
  add(3,  5, 15, 'Gym — Legs + Cardio',       'gym',  65)
  add(5,  5, 15, 'Gym — Arms + Abs + Cardio', 'gym',  65)

  /* Non-French evening pattern: Mon / Wed / Thu / Sat */
  NON_FRENCH.forEach((d) => {
    add(d, 18, 15, 'Break',                      'pers', 105)
    add(d, 21, 45, 'Next Toppers — Homework',    'study', 45)
    add(d, 22, 30, 'Wind Down',                  'pers',  30)
  })

  /* French + Tutor evening: Tue / Fri */
  FRENCH.forEach((d) => {
    add(d, 18, 15, 'French Class',               'study', 95)
    add(d, 19, 50, 'Break',                      'pers',  10)
    add(d, 21, 45, 'Tutor Sir',                  'study', 60)
    add(d, 22, 45, 'Wind Down',                  'pers',  15)
  })

  /* ── SUNDAY ────────────────────────────────────────────── */
  SUN.forEach((d) => {
    add(d,  7,  0, 'Wake Up — Rest Day',         'pers',  30)
    add(d,  7, 30, 'Morning Walk',               'gym',   40)
    add(d,  8, 15, 'Breakfast',                  'diet',  30)
    add(d,  9,  0, 'Reading',                    'growth', 60)
    add(d, 10,  0, 'Kairos Deep Work',           'work',  180)
    add(d, 13,  0, 'Lunch',                      'diet',  30)
    add(d, 14,  0, 'Study + Revision',           'study', 120)
    add(d, 15, 45, 'Snack',                      'diet',  15)
    add(d, 16,  0, 'Free Time — Minecraft / Rest','pers', 150)
    add(d, 18, 30, 'Full Body Stretch',          'gym',   20)
    add(d, 20,  0, 'Dinner',                     'diet',  30)
    add(d, 21,  0, 'Week Prep',                  'pers',  60)
    add(d, 22,  0, 'Sleep',                      'pers',  480)
  })

  return events
}

export function useSchedule() {
  /* Using 'schedule_events' → stored as 'arete_schedule_events' */
  const [events, setEvents] = useLocalStorage('schedule_events', buildDefaultEvents())

  const addEvent    = (event)       => setEvents((prev) => [...prev, { ...event, id: `ev_${Date.now()}` }])
  const updateEvent = (id, updates) => setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  const deleteEvent = (id)          => setEvents((prev) => prev.filter((e) => e.id !== id))

  return { events, addEvent, updateEvent, deleteEvent }
}
