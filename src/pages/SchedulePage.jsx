import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence }                  from 'framer-motion'
import {
  format, isSameDay, isToday, addWeeks, startOfWeek, addDays,
} from 'date-fns'
import { useApp }         from '../context/AppContext'
import { useIsMobile }    from '../hooks/useIsMobile'
import { CAT_COLORS, CAT_LABELS } from '../hooks/useSchedule'
import OrnamentalDivider  from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const HOUR_H  = 52
const START_H = 5
const END_H   = 23

/* Map old/new category names → display prefix */
const catLabel = (cat) => CAT_LABELS[cat] || CAT_LABELS.other || '[—]'
const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS.other

const CATEGORIES = ['pers', 'gym', 'study', 'diet', 'mma', 'work', 'growth', 'other']
const DURATIONS  = [
  { label: '30m', value: 30  },
  { label: '1h',  value: 60  },
  { label: '2h',  value: 120 },
  { label: '3h',  value: 180 },
]

function getWeekDays(base) {
  const start = startOfWeek(base, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function nowLineTop() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  if (h < START_H || h >= END_H) return null
  return ((h - START_H) + m / 60) * HOUR_H
}

// ── Desktop: Day Selector Strip (left column) ─────────────────
function DayStrip({ days, selected, onSelect, events }) {
  return (
    <div
      className="flex flex-col flex-shrink-0 overflow-y-auto schedule-desktop-only"
      style={{ width: 200, borderRight: '1px solid var(--border)' }}
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selected)
        const isNow      = isToday(day)
        const dayEvents  = events.filter((e) => isSameDay(new Date(e.startTime), day))

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className="flex flex-col items-start px-5 py-4 text-left transition-colors"
            style={{
              borderLeft:   isSelected ? '2px solid var(--gold)' : '2px solid transparent',
              background:   isSelected ? '#1A1610' : 'transparent',
              borderBottom: '1px solid var(--divider)',
            }}
          >
            <span
              className="font-cinzel uppercase"
              style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)' }}
            >
              {format(day, 'EEE')}
            </span>
            <span
              className="font-cormorant"
              style={{
                fontSize:   '28px',
                color:      isNow ? 'var(--gold)' : isSelected ? 'var(--text)' : 'var(--muted)',
                lineHeight: 1.1,
                marginTop:  2,
              }}
            >
              {format(day, 'd')}
            </span>
            {dayEvents.length > 0 && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', marginTop: 4, opacity: 0.7 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Mobile: Horizontal Day Chips ──────────────────────────────
function MobileDayStrip({ days, selected, onSelect, events }) {
  return (
    <div className="day-chips-scroll schedule-mobile-strip flex-shrink-0" style={{ borderBottom: '1px solid var(--divider)' }}>
      {days.map((day) => {
        const isSelected = isSameDay(day, selected)
        const isNow      = isToday(day)
        const hasEvents  = events.some((e) => isSameDay(new Date(e.startTime), day))

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={`day-chip${isSelected ? ' selected' : ''}`}
          >
            <span
              className="font-cinzel uppercase"
              style={{ fontSize: '8px', color: isNow ? 'var(--gold)' : 'var(--faint)', letterSpacing: '0.14em', marginBottom: 2 }}
            >
              {format(day, 'EEE')}
            </span>
            <span
              className="font-cormorant"
              style={{ fontSize: '18px', color: isNow ? 'var(--gold)' : isSelected ? 'var(--text)' : 'var(--muted)', lineHeight: 1 }}
            >
              {format(day, 'd')}
            </span>
            {hasEvents && (
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--gold)', marginTop: 2, opacity: 0.7 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Column-aware overlap layout ────────────────────────────────
// Uses interval scheduling: assigns each event to the first column
// where it doesn't temporally overlap the previous event.
function assignColumns(evts) {
  const sorted    = [...evts].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  const colEndMin = [] // end-minute of last event in each column

  return sorted.map((ev) => {
    const start    = new Date(ev.startTime)
    const startMin = start.getHours() * 60 + start.getMinutes()
    const endMin   = startMin + ev.duration
    const top      = ((startMin - START_H * 60) / 60) * HOUR_H
    const height   = (ev.duration / 60) * HOUR_H

    let col = colEndMin.findIndex((e) => e <= startMin)
    if (col === -1) { col = colEndMin.length; colEndMin.push(endMin) }
    else            { colEndMin[col] = endMin }

    return { ...ev, _top: top, _height: Math.max(height, 48), _col: col, _startMin: startMin, _endMin: endMin }
  })
}

// ── Event block on timeline ───────────────────────────────────
// totalCols prop controls side-by-side column width
const LABEL_W = 64 // px — matches left-16 Tailwind

function TimelineEvent({ event, totalCols, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const color = catColor(event.category)
  const label = catLabel(event.category)
  const col   = event._col || 0

  // Compute left/right so events share the space fairly
  const leftExpr  = totalCols === 1
    ? `${LABEL_W}px`
    : `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${col} / ${totalCols})`
  const rightExpr = totalCols === 1
    ? '0px'
    : `calc((100% - ${LABEL_W}px) * ${totalCols - col - 1} / ${totalCols})`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1500)}
      className="absolute transition-colors"
      style={{
        top:         event._top,
        left:        leftExpr,
        right:       rightExpr,
        minHeight:   48,
        height:      event._height,
        borderLeft:  `2px solid ${color}`,
        paddingLeft: 10,
        paddingTop:  4,
        background:  hovered ? '#1A1610' : 'transparent',
        zIndex:      5 + col,
        overflow:    'hidden',
      }}
    >
      <p className="font-cinzel" style={{ fontSize: '8px', color, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <p className="font-cormorant" style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {event.title}
      </p>
      <p className="font-mono" style={{ fontSize: '9px', color: 'var(--muted)' }}>
        {format(new Date(event.startTime), 'h:mm a')} · {event.duration}m
      </p>
      {hovered && (
        <button
          className="absolute top-1 right-2 font-mono"
          style={{ fontSize: '14px', color: 'var(--muted)', minHeight: 'unset' }}
          onClick={() => onDelete(event.id)}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ── Center timeline (shared desktop + mobile) ─────────────────
function DayTimeline({ day, events, onDelete, onAddClick }) {
  const [now, setNow]  = useState(new Date())
  const containerRef   = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const top = nowLineTop()
      if (top !== null) containerRef.current.scrollTop = Math.max(0, top - 120)
    }
  }, [day])

  const hours   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i)
  const dayEvts = events.filter((e) => isSameDay(new Date(e.startTime), day))
  const nowTop  = isToday(day) ? nowLineTop() : null

  const decorated  = assignColumns(dayEvts)
  const totalCols  = decorated.length > 0 ? Math.max(...decorated.map((e) => e._col)) + 1 : 1

  return (
    <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: '1px solid var(--border)' }}>
      {/* Day heading */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        <p className="font-cormorant" style={{ fontSize: '22px', color: 'var(--text)', fontWeight: 500 }}>
          {format(day, 'EEEE')}
          {isToday(day) && (
            <span className="font-cinzel" style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.2em', marginLeft: 12 }}>
              TODAY
            </span>
          )}
        </p>
        <p className="font-mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>
          {format(day, 'MMMM d, yyyy')} · {dayEvts.length} events
        </p>
      </div>

      {/* Scrollable timeline */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="relative" style={{ height: (END_H - START_H + 1) * HOUR_H }}>
          {/* Hour rows */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute w-full flex items-start"
              style={{ top: (h - START_H) * HOUR_H, height: HOUR_H }}
              onClick={() => onAddClick(day, h)}
            >
              <span
                className="font-mono flex-shrink-0 text-right"
                style={{ width: 56, fontSize: '10px', color: 'var(--faint)', paddingRight: 8, paddingTop: 2 }}
              >
                {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
              </span>
              <div style={{ flex: 1, borderTop: '1px solid var(--divider)', height: '100%' }} />
            </div>
          ))}

          {/* Now line */}
          {nowTop !== null && (
            <div
              className="absolute pointer-events-none"
              style={{ top: nowTop, left: 56, right: 0, zIndex: 10 }}
            >
              <div style={{ height: 1, background: 'var(--gold)', opacity: 0.6, width: '100%' }} />
              <div
                style={{
                  position:   'absolute',
                  left:       -5,
                  top:        -4,
                  width:      8,
                  height:     8,
                  background: 'var(--gold)',
                  transform:  'rotate(45deg)',
                }}
              />
            </div>
          )}

          {/* Events */}
          {decorated.map((ev) => (
            <TimelineEvent key={ev.id} event={ev} totalCols={totalCols} onDelete={onDelete} />
          ))}
        </div>

        {/* Desktop add button */}
        <div
          className="flex-shrink-0 px-6 py-5 schedule-desktop-only"
          style={{ borderTop: '1px solid var(--divider)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="font-cinzel uppercase"
            style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.2em' }}
            onClick={() => onAddClick(day, 9)}
          >
            + Add Event
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Week mini overview (right column, desktop only) ───────────
function WeekOverview({ days, selected, onSelect, events }) {
  return (
    <div
      className="flex-shrink-0 overflow-y-auto schedule-desktop-only"
      style={{ width: 220 }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
        <p className="section-label">This Week</p>
      </div>
      {days.map((day) => {
        const isSelected = isSameDay(day, selected)
        const isNow      = isToday(day)
        const dayEvts    = events
          .filter((e) => isSameDay(new Date(e.startTime), day))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 2)
        const total = events.filter((e) => isSameDay(new Date(e.startTime), day)).length

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className="w-full text-left px-5 py-3 transition-colors"
            style={{
              background:   isSelected ? '#1A1610' : 'transparent',
              borderBottom: '1px solid var(--divider)',
              borderLeft:   isSelected ? '2px solid var(--gold)' : '2px solid transparent',
            }}
          >
            <p
              className="font-cinzel uppercase"
              style={{ fontSize: '8px', letterSpacing: '0.18em', color: isNow ? 'var(--gold)' : 'var(--muted)', marginBottom: 3 }}
            >
              {format(day, 'EEE d')}
              {total > 0 && (
                <span className="font-mono" style={{ marginLeft: 6, color: 'var(--faint)' }}>
                  {total}
                </span>
              )}
            </p>
            {dayEvts.map((ev) => (
              <p
                key={ev.id}
                className="font-garamond truncate"
                style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}
              >
                {ev.title}
              </p>
            ))}
          </button>
        )
      })}
    </div>
  )
}

// ── Inline add event form ─────────────────────────────────────
function AddEventForm({ defaultDay, defaultHour, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:    '',
    timeH:    String(defaultHour).padStart(2, '0'),
    timeM:    '00',
    duration: 60,
    category: 'pers',
    recurring:'none',
  })

  const handleSave = () => {
    if (!form.title.trim()) return
    const start = new Date(defaultDay)
    start.setHours(Number(form.timeH), Number(form.timeM), 0, 0)
    onSave({
      title:     form.title,
      category:  form.category,
      startTime: start.toISOString(),
      duration:  form.duration,
      recurring: form.recurring,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(12,10,8,0.7)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
        style={{
          background:  'var(--surface)',
          borderTop:   '1px solid rgba(201,168,76,0.4)',
          padding:     '24px 24px 32px',
          maxWidth:    800,
          margin:      '0 auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '10px', color: 'var(--text)', letterSpacing: '0.22em' }}>
            Add Event · {format(defaultDay, 'EEE, MMM d')}
          </p>
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onCancel}>Close</button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Event name..."
            className="input-underline font-cormorant"
            style={{ fontSize: '18px' }}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />

          {/* Time + Duration in a row */}
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="section-label" style={{ marginBottom: 6 }}>Time</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="23"
                  value={form.timeH}
                  onChange={(e) => setForm((p) => ({ ...p, timeH: e.target.value.padStart(2,'0') }))}
                  className="font-mono text-center"
                  style={{ width: 52, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px', fontSize: '14px', outline: 'none', minHeight: 'unset' }}
                />
                <span className="font-mono" style={{ color: 'var(--muted)' }}>:</span>
                <input
                  type="number" min="0" max="59" step="15"
                  value={form.timeM}
                  onChange={(e) => setForm((p) => ({ ...p, timeM: e.target.value.padStart(2,'0') }))}
                  className="font-mono text-center"
                  style={{ width: 52, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px', fontSize: '14px', outline: 'none', minHeight: 'unset' }}
                />
              </div>
            </div>

            <div>
              <p className="section-label" style={{ marginBottom: 6 }}>Duration</p>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setForm((p) => ({ ...p, duration: d.value }))}
                    className="font-cinzel uppercase"
                    style={{
                      fontSize:    '9px',
                      letterSpacing: '0.1em',
                      color:       form.duration === d.value ? 'var(--bg)' : 'var(--muted)',
                      background:  form.duration === d.value ? 'var(--gold)' : 'transparent',
                      border:      '1px solid',
                      borderColor: form.duration === d.value ? 'var(--gold)' : 'var(--border)',
                      padding:     '6px 12px',
                      minHeight:   'unset',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((p) => ({ ...p, category: c }))}
                  className="font-cinzel uppercase"
                  style={{
                    fontSize:    '8px',
                    letterSpacing: '0.1em',
                    color:       form.category === c ? 'var(--bg)' : 'var(--muted)',
                    background:  form.category === c ? 'var(--gold)' : 'transparent',
                    border:      '1px solid',
                    borderColor: form.category === c ? 'var(--gold)' : 'var(--border)',
                    padding:     '6px 10px',
                    minHeight:   'unset',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Recurring</p>
            <div className="flex gap-2">
              {['once', 'daily', 'weekly'].map((r) => (
                <button
                  key={r}
                  onClick={() => setForm((p) => ({ ...p, recurring: r === 'once' ? 'none' : r }))}
                  className="font-cinzel uppercase"
                  style={{
                    fontSize:    '9px',
                    letterSpacing: '0.1em',
                    color:       (form.recurring === r || (r === 'once' && form.recurring === 'none')) ? 'var(--bg)' : 'var(--muted)',
                    background:  (form.recurring === r || (r === 'once' && form.recurring === 'none')) ? 'var(--gold)' : 'transparent',
                    border:      '1px solid',
                    borderColor: (form.recurring === r || (r === 'once' && form.recurring === 'none')) ? 'var(--gold)' : 'var(--border)',
                    padding:     '6px 12px',
                    minHeight:   'unset',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <button className="btn-secondary" style={{ fontSize: '9px', padding: '10px 20px' }} onClick={onCancel}>Cancel</button>
            <button className="btn-primary"   style={{ fontSize: '9px', padding: '10px 20px' }} onClick={handleSave}>Save Event</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function SchedulePage() {
  const { events, addEvent, deleteEvent, showToast } = useApp()
  const isMobile = useIsMobile()

  const [weekBase,     setWeekBase]     = useState(new Date())
  const [selectedDay,  setSelectedDay]  = useState(new Date())
  const [addFormState, setAddFormState] = useState(null)

  const days = getWeekDays(weekBase)

  const handleAddClick = (day, hour) => {
    setSelectedDay(day)
    setAddFormState({ day, hour })
  }

  const handleSaveEvent = (data) => {
    addEvent(data)
    showToast('Event added')
    setAddFormState(null)
  }

  return (
    <motion.div {...PAGE} className="flex flex-col" style={{ height: '100%' }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between flex-shrink-0 pb-4"
        style={{ borderBottom: '1px solid var(--divider)', padding: '16px 20px 16px' }}
      >
        <div>
          <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.3em', marginBottom: 4 }}>
            Calendarium
          </p>
          <p className="font-cormorant italic" style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 500 }}>
            {format(weekBase, 'MMMM, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-ghost"
            style={{ fontSize: '9px' }}
            onClick={() => setWeekBase((d) => addWeeks(d, -1))}
          >
            ← Prev
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: '9px' }}
            onClick={() => { setWeekBase(new Date()); setSelectedDay(new Date()) }}
          >
            Today
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: '9px' }}
            onClick={() => setWeekBase((d) => addWeeks(d, 1))}
          >
            Next →
          </button>
        </div>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── Mobile: horizontal day chips ── */}
      <MobileDayStrip
        days={days}
        selected={selectedDay}
        onSelect={setSelectedDay}
        events={events}
      />

      {/* ── Three-column body (desktop) / single column (mobile) ── */}
      <div
        className="flex flex-1 min-h-0"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Left day strip — desktop only */}
        <DayStrip
          days={days}
          selected={selectedDay}
          onSelect={setSelectedDay}
          events={events}
        />

        {/* Center timeline — always visible */}
        <DayTimeline
          day={selectedDay}
          events={events}
          onDelete={(id) => { deleteEvent(id); showToast('Event removed', 'error') }}
          onAddClick={handleAddClick}
        />

        {/* Right week overview — desktop only */}
        <WeekOverview
          days={days}
          selected={selectedDay}
          onSelect={setSelectedDay}
          events={events}
        />
      </div>

      {/* ── Mobile FAB (floating add button) ── */}
      {isMobile && (
        <button
          className="fab"
          onClick={() => handleAddClick(selectedDay, 9)}
          aria-label="Add event"
        >
          +
        </button>
      )}

      {/* ── Add event form ── */}
      <AnimatePresence>
        {addFormState && (
          <AddEventForm
            key="add-form"
            defaultDay={addFormState.day}
            defaultHour={addFormState.hour}
            onSave={handleSaveEvent}
            onCancel={() => setAddFormState(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
