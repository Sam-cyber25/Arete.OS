import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence }                           from 'framer-motion'
import {
  format, isSameDay, isToday,
  addWeeks, subWeeks, startOfWeek, addDays,
} from 'date-fns'
import { useApp }                    from '../context/AppContext'
import { useIsMobile }               from '../hooks/useIsMobile'
import { CAT_COLORS, CAT_LABELS }    from '../hooks/useSchedule'

/* ─── Constants ──────────────────────────────────────────────── */
const HOUR_H_D  = 64   // px per hour — desktop
const HOUR_H_M  = 56   // px per hour — mobile
const START_H   = 5    // 5 AM
const END_H     = 23   // 11 PM (rows 5→23, plus 23:30 marker)
const LABEL_W_D = 52   // time-label column width — desktop
const LABEL_W_M = 40   // time-label column width — mobile

const PAGE_ANIM = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const CATEGORIES = ['pers', 'gym', 'study', 'diet', 'mma', 'work', 'growth']

const DURATION_OPTS = [
  { label: '30m',  value: 30  },
  { label: '1h',   value: 60  },
  { label: '1.5h', value: 90  },
  { label: '2h',   value: 120 },
  { label: '3h',   value: 180 },
]

/* ─── Helpers ────────────────────────────────────────────────── */
function getWeekDays(base) {
  const start = startOfWeek(base, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function cc(cat) { return CAT_COLORS[cat] || CAT_COLORS.other || '#4A3F32' }
function cl(cat) { return CAT_LABELS[cat] || '[—]' }

function nowMinutes() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

function fmtHour(h) {
  if (h === 0 || h === 24) return '12 AM'
  if (h === 12) return '12 PM'
  return h > 12 ? `${h - 12} PM` : `${h} AM`
}

/* Interval-scheduling column assignment (reused from original) */
function assignColumns(evts) {
  const sorted    = [...evts].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  const colEndMin = []
  return sorted.map((ev) => {
    const start    = new Date(ev.startTime)
    const startMin = start.getHours() * 60 + start.getMinutes()
    const endMin   = startMin + ev.duration
    let col = colEndMin.findIndex((e) => e <= startMin)
    if (col === -1) { col = colEndMin.length; colEndMin.push(endMin) }
    else            { colEndMin[col] = endMin }
    return { ...ev, _startMin: startMin, _col: col }
  })
}

/* ═══════════════════════════════════════════════════════════════
   WEEK STRIP  — top fixed bar: month nav + 7 day columns
════════════════════════════════════════════════════════════════ */
function WeekStrip({ days, selected, weekBase, onSelect, onPrev, onNext, onToday, events, isMobile }) {
  return (
    <div
      style={{
        height:       100,
        minHeight:    100,
        flexShrink:   0,
        borderBottom: '1px solid #2A2520',
        display:      'flex',
        flexDirection:'column',
      }}
    >
      {/* ── Row 1: month navigation (36px) ── */}
      <div
        style={{
          height:          36,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '0 16px',
          borderBottom:    '1px solid #1E1A15',
          flexShrink:      0,
        }}
      >
        <button
          className="icon-btn font-cinzel uppercase"
          style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.16em', minHeight: 'unset', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={onPrev}
        >
          ← PREV
        </button>

        <span
          className="font-cormorant"
          style={{ fontSize: isMobile ? '18px' : '22px', color: 'var(--text)', fontStyle: 'italic' }}
        >
          {format(weekBase, 'MMMM, yyyy')}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="icon-btn font-cinzel uppercase"
            style={{ fontSize: '9px', color: '#C9A84C', letterSpacing: '0.16em', minHeight: 'unset', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={onToday}
          >
            TODAY
          </button>
          <button
            className="icon-btn font-cinzel uppercase"
            style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.16em', minHeight: 'unset', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={onNext}
          >
            NEXT →
          </button>
        </div>
      </div>

      {/* ── Row 2: 7 day columns (64px) ── */}
      <div
        style={{
          display:    'flex',
          flex:       1,
          overflowX:  isMobile ? 'auto' : 'hidden',
          scrollSnapType: isMobile ? 'x mandatory' : undefined,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {days.map((day) => {
          const isSel     = isSameDay(day, selected)
          const isNow     = isToday(day)
          const hasEvents = events.some((e) => isSameDay(new Date(e.startTime), day))

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              style={{
                flex:           isMobile ? 'none' : '1',
                width:          isMobile ? 44 : undefined,
                minWidth:       isMobile ? 44 : undefined,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            2,
                cursor:         'pointer',
                background:     isSel ? 'rgba(201,168,76,0.04)' : 'transparent',
                borderBottom:   isSel ? '2px solid #C9A84C' : '2px solid transparent',
                border:         'none',
                position:       'relative',
                paddingTop:     isNow && !isSel ? 10 : 14,
                paddingBottom:  4,
                scrollSnapAlign:'center',
                minHeight:      'unset',
                transition:     'background 150ms ease',
              }}
            >
              {/* ◆ today indicator */}
              {isNow && !isSel && (
                <span
                  style={{
                    position:  'absolute',
                    top:       3,
                    fontSize:  '6px',
                    color:     '#C9A84C',
                    lineHeight: 1,
                  }}
                >
                  ◆
                </span>
              )}

              <span
                className="font-cinzel uppercase"
                style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.12em' }}
              >
                {format(day, 'EEE')}
              </span>

              <span
                className="font-cormorant"
                style={{
                  fontSize:   '26px',
                  lineHeight: 1.05,
                  color:      isSel ? '#C9A84C' : isNow ? '#E8DFC8' : 'var(--muted)',
                }}
              >
                {format(day, 'd')}
              </span>

              {hasEvents && (
                <div
                  style={{
                    width: 3, height: 3, borderRadius: '50%',
                    background: '#C9A84C', opacity: isSel ? 1 : 0.6,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EVENT BLOCK  — absolute-positioned block on the timeline
════════════════════════════════════════════════════════════════ */
function EventBlock({ event, totalCols, hourH, labelW, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const color    = cc(event.category)
  const label    = cl(event.category)
  const col      = event._col || 0

  const top    = ((event._startMin - START_H * 60) / 60) * hourH
  const height = Math.max((event.duration / 60) * hourH, hourH < 64 ? 36 : 40)

  const leftExpr  = totalCols === 1
    ? `${labelW}px`
    : `calc(${labelW}px + (100% - ${labelW}px) * ${col} / ${totalCols})`
  const rightExpr = totalCols === 1
    ? '0px'
    : `calc((100% - ${labelW}px) * ${totalCols - col - 1} / ${totalCols})`

  const endMs  = new Date(event.startTime).getTime() + event.duration * 60000
  const timeStr = `${format(new Date(event.startTime), 'h:mm a')} — ${format(new Date(endMs), 'h:mm a')}`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1800)}
      style={{
        position:   'absolute',
        top,
        left:       leftExpr,
        right:      rightExpr,
        height,
        zIndex:     5 + col,
        display:    'flex',
        overflow:   'hidden',
        background: hovered ? '#1A1610' : '#13110E',
        border:     `1px solid ${hovered ? `${color}55` : '#2A2520'}`,
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      {/* Left accent bar */}
      <div style={{ width: 3, minWidth: 3, background: color, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ padding: '6px 10px', flex: 1, minWidth: 0 }}>
        <p
          className="font-cinzel"
          style={{ fontSize: '7px', color, letterSpacing: '0.15em', marginBottom: 2 }}
        >
          {label}
        </p>
        <p
          className="font-garamond"
          style={{
            fontSize:     hourH < 64 ? '13px' : '14px',
            color:        '#E8DFC8',
            lineHeight:   1.2,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {event.title}
        </p>
        {height >= 56 && (
          <p
            className="font-mono"
            style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 2 }}
          >
            {timeStr}
          </p>
        )}
      </div>

      {/* Delete on hover */}
      {hovered && (
        <button
          className="icon-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
          style={{
            position:   'absolute',
            top:        3,
            right:      6,
            fontSize:   '15px',
            color:      'var(--muted)',
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
            lineHeight: 1,
            minHeight:  'unset',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DAY VIEW  — sticky header + scrollable timeline
════════════════════════════════════════════════════════════════ */
function DayView({ day, events, onDelete, onAddClick, isMobile }) {
  const hourH    = isMobile ? HOUR_H_M  : HOUR_H_D
  const labelW   = isMobile ? LABEL_W_M : LABEL_W_D
  const scrollRef = useRef(null)
  const [nowMin, setNowMin] = useState(nowMinutes)
  const [hoverH, setHoverH] = useState(null)

  /* Update current time every minute */
  useEffect(() => {
    const t = setInterval(() => setNowMin(nowMinutes()), 60000)
    return () => clearInterval(t)
  }, [])

  /* Auto-scroll to current time on day change */
  useEffect(() => {
    if (!scrollRef.current) return
    const nm     = nowMinutes()
    const target = nm < START_H * 60
      ? 0
      : ((nm - START_H * 60) / 60) * hourH - 140
    scrollRef.current.scrollTop = Math.max(0, target)
  }, [day, hourH])

  const dayEvts   = useMemo(() => events.filter((e) => isSameDay(new Date(e.startTime), day)), [events, day])
  const decorated = useMemo(() => assignColumns(dayEvts), [dayEvts])
  const totalCols = decorated.length ? Math.max(...decorated.map((e) => e._col)) + 1 : 1

  /* Now-line top offset */
  const nowTop = isToday(day) && nowMin >= START_H * 60 && nowMin < END_H * 60
    ? ((nowMin - START_H * 60) / 60) * hourH
    : null

  const hours   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i)
  const totalH  = (END_H - START_H + 0.5) * hourH  // +0.5 for 23:30 half-row

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}>

      {/* ── Sticky day header ── */}
      <div
        style={{
          flexShrink:     0,
          padding:        isMobile ? '10px 16px' : '12px 24px',
          borderBottom:   '1px solid #2A2520',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          background:     'var(--bg)',
        }}
      >
        <div>
          <p
            className="font-cormorant"
            style={{
              fontSize:  isMobile ? '26px' : '32px',
              color:     'var(--text)',
              fontStyle: 'italic',
              fontWeight:500,
              lineHeight:1.1,
            }}
          >
            {format(day, 'EEEE')}
          </p>
          <p
            className="font-garamond"
            style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 2 }}
          >
            {format(day, 'MMMM d, yyyy')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'var(--muted)' }}
          >
            {dayEvts.length} {dayEvts.length === 1 ? 'event' : 'events'}
          </span>
          <button
            className="btn-primary"
            style={{ fontSize: '9px', padding: '8px 14px', letterSpacing: '0.16em' }}
            onClick={() => onAddClick(day, 9)}
          >
            + EVENT
          </button>
        </div>
      </div>

      {/* ── Scrollable timeline ── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}
      >
        <div style={{ height: totalH, position: 'relative' }}>

          {/* Hour rows */}
          {hours.map((h) => {
            const rowTop = (h - START_H) * hourH
            return (
              <div
                key={h}
                style={{ position: 'absolute', top: rowTop, left: 0, right: 0, height: hourH, cursor: 'pointer' }}
                onMouseEnter={() => setHoverH(h)}
                onMouseLeave={() => setHoverH(null)}
                onClick={() => onAddClick(day, h)}
              >
                {/* Full-hour line */}
                <div
                  style={{
                    position:   'absolute',
                    top:        0,
                    left:       labelW,
                    right:      0,
                    height:     1,
                    background: '#1E1A15',
                  }}
                />

                {/* Half-hour dashed line */}
                <div
                  style={{
                    position:   'absolute',
                    top:        hourH / 2,
                    left:       labelW,
                    right:      0,
                    height:     1,
                    borderTop:  '1px dashed #181410',
                  }}
                />

                {/* Time label */}
                <span
                  className="font-mono"
                  style={{
                    position:    'absolute',
                    left:        0,
                    top:         3,
                    width:       labelW,
                    fontSize:    '10px',
                    color:       'var(--faint)',
                    textAlign:   'right',
                    paddingRight:8,
                    lineHeight:  1,
                    pointerEvents: 'none',
                  }}
                >
                  {fmtHour(h)}
                </span>

                {/* Hover ghost "add" indicator */}
                {hoverH === h && (
                  <span
                    className="font-cinzel"
                    style={{
                      position:      'absolute',
                      left:          labelW + 8,
                      top:           '50%',
                      transform:     'translateY(-50%)',
                      fontSize:      '9px',
                      color:         'var(--faint)',
                      letterSpacing: '0.14em',
                      pointerEvents: 'none',
                    }}
                  >
                    + Add
                  </span>
                )}
              </div>
            )
          })}

          {/* 23:30 half-hour marker */}
          <div
            style={{
              position:  'absolute',
              top:       (END_H - START_H) * hourH + hourH / 2,
              left:      labelW,
              right:     0,
              height:    1,
              borderTop: '1px dashed #181410',
            }}
          />
          <span
            className="font-mono"
            style={{
              position:    'absolute',
              left:        0,
              top:         (END_H - START_H) * hourH + hourH / 2 + 3,
              width:       labelW,
              fontSize:    '10px',
              color:       'var(--faint)',
              textAlign:   'right',
              paddingRight:8,
            }}
          >
            11:30
          </span>

          {/* ── Current-time indicator ── */}
          {nowTop !== null && (
            <div
              style={{
                position:      'absolute',
                top:           nowTop,
                left:          0,
                right:         0,
                zIndex:        10,
                pointerEvents: 'none',
              }}
            >
              {/* Gold circle */}
              <div
                style={{
                  position:     'absolute',
                  left:         labelW - 3,
                  top:          -3,
                  width:        6,
                  height:       6,
                  borderRadius: '50%',
                  background:   '#C9A84C',
                }}
              />
              {/* Horizontal line */}
              <div
                style={{
                  position:   'absolute',
                  left:       labelW,
                  right:      0,
                  top:        0,
                  height:     1,
                  background: '#C9A84C',
                  opacity:    0.6,
                }}
              />
            </div>
          )}

          {/* ── Event blocks ── */}
          {decorated.map((ev) => (
            <EventBlock
              key={ev.id}
              event={ev}
              totalCols={totalCols}
              hourH={hourH}
              labelW={labelW}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   THIS WEEK PANEL  — right sidebar, desktop ≥ 1024px only
════════════════════════════════════════════════════════════════ */
function ThisWeekPanel({ days, selected, onSelect, events }) {
  return (
    <div
      style={{
        width:      200,
        minWidth:   200,
        borderLeft: '1px solid #2A2520',
        overflowY:  'auto',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1E1A15' }}>
        <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.22em' }}>
          This Week
        </p>
      </div>

      {days.map((day) => {
        const isSel  = isSameDay(day, selected)
        const isNow  = isToday(day)
        const allEvts = events
          .filter((e) => isSameDay(new Date(e.startTime), day))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        const preview = allEvts.slice(0, 2)
        const total   = allEvts.length

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            style={{
              display:      'block',
              width:        '100%',
              textAlign:    'left',
              padding:      '10px 16px',
              borderBottom: '1px solid #1E1A15',
              borderLeft:   isSel ? '2px solid #C9A84C' : '2px solid transparent',
              background:   isSel ? '#1A1610' : 'transparent',
              cursor:       'pointer',
              minHeight:    'unset',
              transition:   'background 130ms ease',
            }}
          >
            <p
              className="font-cinzel uppercase"
              style={{ fontSize: '8px', letterSpacing: '0.16em', color: isNow ? '#C9A84C' : 'var(--muted)', marginBottom: 4 }}
            >
              {format(day, 'EEE d')}
              {total > 0 && (
                <span className="font-mono" style={{ marginLeft: 6, fontSize: '8px', color: 'var(--faint)' }}>
                  {total}
                </span>
              )}
            </p>

            {preview.map((ev) => (
              <p
                key={ev.id}
                className="font-garamond"
                style={{
                  fontSize:     '11px',
                  color:        'var(--muted)',
                  lineHeight:   1.5,
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}
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

/* ═══════════════════════════════════════════════════════════════
   ADD EVENT SHEET  — bottom sheet (mobile) / centered overlay (desktop)
════════════════════════════════════════════════════════════════ */
function AddEventSheet({ defaultDay, defaultHour, onSave, onCancel, isMobile }) {
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
    const d = new Date(defaultDay)
    d.setHours(Number(form.timeH), Number(form.timeM), 0, 0)
    onSave({
      title:     form.title.trim(),
      category:  form.category,
      startTime: d.toISOString(),
      duration:  form.duration,
      recurring: form.recurring,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         50,
        display:        'flex',
        alignItems:     isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        background:     'rgba(12,10,8,0.78)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: isMobile ? 48 : 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: isMobile ? 48 : 20, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:  'var(--surface)',
          borderTop:   '1px solid rgba(201,168,76,0.4)',
          padding:     '20px 24px 36px',
          width:       '100%',
          maxWidth:    isMobile ? undefined : 680,
          maxHeight:   '88vh',
          overflowY:   'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.24em' }}>
            New Event · {format(defaultDay, 'EEE, MMM d')}
          </p>
          <button
            className="icon-btn"
            onClick={onCancel}
            style={{ fontSize: '20px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, minHeight: 'unset' }}
          >
            ×
          </button>
        </div>

        {/* Title */}
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="What happens?"
          className="input-underline font-cormorant"
          style={{ fontSize: '18px', marginBottom: 20, width: '100%' }}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        {/* Time + Duration */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Time</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min="0" max="23"
                value={form.timeH}
                onChange={(e) => setForm((p) => ({ ...p, timeH: String(e.target.value).padStart(2, '0') }))}
                className="font-mono"
                style={{ width: 48, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px', fontSize: '14px', outline: 'none', minHeight: 'unset' }}
              />
              <span className="font-mono" style={{ color: 'var(--muted)' }}>:</span>
              <input
                type="number" min="0" max="59" step="15"
                value={form.timeM}
                onChange={(e) => setForm((p) => ({ ...p, timeM: String(e.target.value).padStart(2, '0') }))}
                className="font-mono"
                style={{ width: 48, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px', fontSize: '14px', outline: 'none', minHeight: 'unset' }}
              />
            </div>
          </div>

          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Duration</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DURATION_OPTS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setForm((p) => ({ ...p, duration: d.value }))}
                  className="font-cinzel icon-btn"
                  style={{
                    fontSize:     '8px',
                    letterSpacing:'0.1em',
                    padding:      '6px 10px',
                    border:       '1px solid',
                    borderColor:  form.duration === d.value ? '#C9A84C' : 'var(--border)',
                    color:        form.duration === d.value ? 'var(--bg)' : 'var(--muted)',
                    background:   form.duration === d.value ? '#C9A84C' : 'transparent',
                    cursor:       'pointer',
                    minHeight:    'unset',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Category</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => {
              const col    = cc(c)
              const active = form.category === c
              return (
                <button
                  key={c}
                  onClick={() => setForm((p) => ({ ...p, category: c }))}
                  className="font-cinzel icon-btn uppercase"
                  style={{
                    fontSize:     '8px',
                    letterSpacing:'0.12em',
                    padding:      '6px 10px',
                    border:       `1px solid ${active ? col : 'var(--border)'}`,
                    color:        active ? col : 'var(--muted)',
                    background:   active ? `${col}18` : 'transparent',
                    cursor:       'pointer',
                    minHeight:    'unset',
                  }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recurring */}
        <div style={{ marginBottom: 24 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Recurring</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'ONCE',   value: 'none'   },
              { label: 'DAILY',  value: 'daily'  },
              { label: 'WEEKLY', value: 'weekly' },
            ].map(({ label, value }) => {
              const active = form.recurring === value
              return (
                <button
                  key={value}
                  onClick={() => setForm((p) => ({ ...p, recurring: value }))}
                  className="font-cinzel icon-btn"
                  style={{
                    fontSize:     '8px',
                    letterSpacing:'0.12em',
                    padding:      '6px 12px',
                    border:       '1px solid',
                    borderColor:  active ? '#C9A84C' : 'var(--border)',
                    color:        active ? 'var(--bg)' : 'var(--muted)',
                    background:   active ? '#C9A84C' : 'transparent',
                    cursor:       'pointer',
                    minHeight:    'unset',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            className="btn-ghost"
            style={{ fontSize: '9px' }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: '9px', padding: '10px 20px' }}
            onClick={handleSave}
          >
            Save Event
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function SchedulePage() {
  const { events, addEvent, deleteEvent, showToast } = useApp()
  const isMobile = useIsMobile()

  /* Wide = desktop ≥ 1024px → show right panel */
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024 && !isMobile
  )
  useEffect(() => {
    const mq      = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsWide(e.matches && !isMobile)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [isMobile])

  const [weekBase,    setWeekBase]    = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [addForm,     setAddForm]     = useState(null)

  const days = useMemo(() => getWeekDays(weekBase), [weekBase])

  const handleSelectDay = useCallback((day) => setSelectedDay(day), [])

  const handleAddClick = useCallback((day, hour) => {
    setSelectedDay(day)
    setAddForm({ day, hour })
  }, [])

  const handleSaveEvent = useCallback((data) => {
    addEvent(data)
    showToast('Event added')
    setAddForm(null)
  }, [addEvent, showToast])

  const handleDelete = useCallback((id) => {
    deleteEvent(id)
    showToast('Event removed', 'error')
  }, [deleteEvent, showToast])

  return (
    <motion.div
      {...PAGE_ANIM}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* ── Week strip (fixed top, 100px) ── */}
      <WeekStrip
        days={days}
        selected={selectedDay}
        weekBase={weekBase}
        onSelect={handleSelectDay}
        onPrev={()  => setWeekBase((d) => subWeeks(d, 1))}
        onNext={()  => setWeekBase((d) => addWeeks(d, 1))}
        onToday={() => { setWeekBase(new Date()); setSelectedDay(new Date()) }}
        events={events}
        isMobile={isMobile}
      />

      {/* ── Body: day view + optional right panel ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DayView
          day={selectedDay}
          events={events}
          onDelete={handleDelete}
          onAddClick={handleAddClick}
          isMobile={isMobile}
        />

        {isWide && (
          <ThisWeekPanel
            days={days}
            selected={selectedDay}
            onSelect={handleSelectDay}
            events={events}
          />
        )}
      </div>

      {/* ── Mobile FAB ── */}
      {isMobile && (
        <button
          className="fab"
          onClick={() => handleAddClick(selectedDay, 9)}
          aria-label="Add event"
        >
          +
        </button>
      )}

      {/* ── Add event sheet ── */}
      <AnimatePresence>
        {addForm && (
          <AddEventSheet
            key="add-sheet"
            defaultDay={addForm.day}
            defaultHour={addForm.hour}
            onSave={handleSaveEvent}
            onCancel={() => setAddForm(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
