import { format, isToday, isThisWeek, startOfWeek, addDays, subWeeks, startOfDay, isSameDay } from 'date-fns'

// ─── Roman Numeral Conversion ────────────────────────────────
const ROMAN_VALUES  = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
const ROMAN_SYMBOLS = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']

export function toRoman(num) {
  if (num <= 0) return ''
  let result = ''
  for (let i = 0; i < ROMAN_VALUES.length; i++) {
    while (num >= ROMAN_VALUES[i]) {
      result += ROMAN_SYMBOLS[i]
      num    -= ROMAN_VALUES[i]
    }
  }
  return result
}

const MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
]

export function formatRomanDate(date) {
  const d = new Date(date)
  return `${toRoman(d.getDate())} ${MONTHS[d.getMonth()]}, ${toRoman(d.getFullYear())}`
}

// ─── Greeting ────────────────────────────────────────────────
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5)  return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Standard formatters ─────────────────────────────────────
export function formatTime(date)      { return format(date, 'HH:mm:ss') }
export function formatDate(date)      { return format(date, 'EEEE, MMMM d, yyyy') }
export function formatShortDate(date) { return format(date, 'MMM d') }
export function formatHourMin(date)   { return format(new Date(date), 'h:mm a') }

export function formatTimestamp(dateStr) {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, "'Today,' HH:mm")
  return format(date, 'MMM d, yyyy')
}

// ─── Week helpers ─────────────────────────────────────────────
export function getWeekDays(weekOffset = 0) {
  const now   = new Date()
  const start = startOfWeek(now, { weekStartsOn: 1 })
  const offsetStart = addDays(start, weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => addDays(offsetStart, i))
}

export function getWeeklyTaskData(tasks) {
  const days      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  return days.map((name, i) => {
    const day   = addDays(weekStart, i)
    const count = tasks.filter((t) => t.completedAt && isSameDay(new Date(t.completedAt), day)).length
    return { name, tasks: count }
  })
}

export function getNotesPerWeek(notes) {
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 3 - i), { weekStartsOn: 1 })
    const weekEnd   = addDays(weekStart, 7)
    const count     = notes.filter((n) => { const d = new Date(n.createdAt); return d >= weekStart && d < weekEnd }).length
    return { week: `W${i + 1}`, notes: count }
  })
}

export function getHeatmapData(tasks, notes) {
  const weeks = 12
  const today = startOfDay(new Date())
  const start = addDays(today, -(weeks * 7 - 1))
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const day       = addDays(start, i)
    const taskCount = tasks.filter((t) => t.completedAt && isSameDay(new Date(t.completedAt), day)).length
    const noteCount = notes.filter((n) => isSameDay(new Date(n.createdAt), day)).length
    return { date: day.toISOString(), count: taskCount + noteCount }
  })
}

export function getLongestStreak(activityDates) {
  if (!activityDates.length) return 0
  const sorted = [...new Set(activityDates.map((d) => startOfDay(new Date(d)).toISOString()))].sort()
  let max = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / (1000 * 60 * 60 * 24)
    if (diff === 1) { current++; max = Math.max(max, current) }
    else current = 1
  }
  return max
}

export function isTaskDueToday(task)     { return task.dueDate ? isToday(new Date(task.dueDate)) : false }
export function isTaskDueThisWeek(task)  { return task.dueDate ? isThisWeek(new Date(task.dueDate), { weekStartsOn: 1 }) : false }

export function getTimeSlots() {
  const slots = []
  for (let h = 6; h <= 23; h++) {
    slots.push({ hour: h, label: format(new Date().setHours(h, 0, 0, 0), 'h:mm a') })
  }
  return slots
}
