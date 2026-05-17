/* ── Timeline geometry ───────────────────────────────────────── */
export const HOUR_PX     = 120          // pixels per hour
export const START_H     = 5            // 5:00 AM
export const END_H       = 23.5         // 11:30 PM
export const TOTAL_HOURS = END_H - START_H          // 18.5
export const TIMELINE_W  = Math.round(TOTAL_HOURS * HOUR_PX)  // 2220 px
export const ROW_H       = 64           // event lane height
export const RULER_H     = 32           // time ruler height
export const EVENT_H     = 52           // event block height (within lane)

/* ── Category display ────────────────────────────────────────── */
// Re-exporting from useSchedule for single source of truth
export { CAT_COLORS, CAT_LABELS } from '../../hooks/useSchedule'

export const CATEGORIES = ['study', 'gym', 'work', 'mma', 'pers', 'diet', 'growth']

/* ── Time helpers ────────────────────────────────────────────── */

/** ISO date string → x pixel offset in the timeline */
export function timeToX(isoStr) {
  if (!isoStr) return 0
  const d = new Date(isoStr)
  return ((d.getHours() + d.getMinutes() / 60) - START_H) * HOUR_PX
}

/** duration in minutes → pixel width */
export function minutesToW(minutes) {
  return ((minutes || 60) / 60) * HOUR_PX
}

/** Format 24h hour + minute → "5:15 AM" */
export function fmt12(h, m) {
  const h12 = h % 12 || 12
  const ap   = h < 12 ? 'AM' : 'PM'
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

/** Return "5:15 AM–6:15 AM" from ISO + duration minutes */
export function fmtRange(isoStr, duration) {
  const d     = new Date(isoStr)
  const sh    = d.getHours(), sm = d.getMinutes()
  const endM  = sh * 60 + sm + (duration || 60)
  const eh    = Math.floor(endM / 60) % 24
  const em    = endM % 60
  return `${fmt12(sh, sm)}–${fmt12(eh, em)}`
}

/** Snap total-minutes value to nearest 15-minute mark */
export function snapTo15(totalMinutes) {
  return Math.round(totalMinutes / 15) * 15
}

/* ── Row-assignment (prevents overlapping blocks) ────────────── */
export function assignRows(events) {
  if (!events?.length) return []

  const sorted = [...events].sort((a, b) => {
    const da = new Date(a.startTime), db = new Date(b.startTime)
    return (da.getHours() * 60 + da.getMinutes()) -
           (db.getHours() * 60 + db.getMinutes())
  })

  const rowEnds = []       // rowEnds[r] = end-minute of last event in row r
  return sorted.map((evt) => {
    const d     = new Date(evt.startTime)
    const start = d.getHours() * 60 + d.getMinutes()
    const end   = start + (evt.duration || 60)

    let row = 0
    while (rowEnds[row] !== undefined && rowEnds[row] > start) row++
    rowEnds[row] = end
    return { ...evt, _row: row }
  })
}

/* ── Filter events for a given date ─────────────────────────── */
export function getEventsForDate(events, dateStr) {
  if (!events?.length || !dateStr) return []
  const target   = new Date(dateStr + 'T00:00:00')
  const targetDOW = target.getDay()

  return events.filter((ev) => {
    if (!ev.startTime) return false
    const evDate = new Date(ev.startTime)
    if (ev.recurring === 'daily')  return true
    if (ev.recurring === 'weekly') return evDate.getDay() === targetDOW
    // 'once' or anything else: exact date match
    const evStr = `${evDate.getFullYear()}-${String(evDate.getMonth()+1).padStart(2,'0')}-${String(evDate.getDate()).padStart(2,'0')}`
    return evStr === dateStr
  })
}
