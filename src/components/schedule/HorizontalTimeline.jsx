import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence }                           from 'framer-motion'
import { format }                                            from 'date-fns'
import {
  HOUR_PX, START_H, END_H, TIMELINE_W, ROW_H, RULER_H,
  timeToX, minutesToW, assignRows, snapTo15,
} from './scheduleConstants'
import TimeRuler  from './TimeRuler'
import EventBlock from './EventBlock'
import { useIsMobile } from '../../hooks/useIsMobile'

const TODAY_STR = format(new Date(), 'yyyy-MM-dd')

function currentTimeX() {
  const now = new Date()
  const h   = now.getHours() + now.getMinutes() / 60
  if (h < START_H || h > END_H) return -1
  return (h - START_H) * HOUR_PX
}

export default function HorizontalTimeline({
  events, selectedDate, isToday, activeFilter, onEditEvent, onAddAtTime,
}) {
  const isMobile  = useIsMobile()
  const scrollRef = useRef(null)
  const rafRef    = useRef(null)

  /* visible range for virtual rendering */
  const [visRange, setVisRange] = useState({ left: -300, right: TIMELINE_W })
  const [nowX, setNowX]         = useState(currentTimeX)

  /* ── mobile scroll hint ── */
  const [showHint, setShowHint] = useState(() => isMobile)

  useEffect(() => {
    if (!isMobile) return
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [isMobile])

  /* ── Update current time every minute ── */
  useEffect(() => {
    const tick = () => setNowX(currentTimeX())
    const id   = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  /* ── Auto-scroll to current time (or start) when date changes ── */
  useEffect(() => {
    if (!scrollRef.current) return
    const cw = scrollRef.current.clientWidth
    let target = 0
    if (isToday) {
      const cx = currentTimeX()
      if (cx >= 0) target = Math.max(0, cx - cw / 3)
    }
    scrollRef.current.scrollLeft = target
  }, [selectedDate, isToday])

  /* ── Virtual rendering: track scrollLeft ── */
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return
      const sl = scrollRef.current.scrollLeft
      const cw = scrollRef.current.clientWidth
      setVisRange({ left: sl - 300, right: sl + cw + 300 })
    })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /* ── Row-assign + compute x/w on each event ── */
  const positioned = useMemo(() => {
    const withPos = events.map((ev) => ({
      ...ev,
      _x: timeToX(ev.startTime),
      _w: Math.max(minutesToW(ev.duration), 12),  // min 12px even for tiny events
    }))
    return assignRows(withPos)
  }, [events])

  /* filter to visible range */
  const visible = useMemo(
    () => positioned.filter((ev) => ev._x + ev._w > visRange.left && ev._x < visRange.right),
    [positioned, visRange]
  )

  const numRows    = useMemo(
    () => Math.max(1, ...positioned.map((e) => e._row + 1)),
    [positioned]
  )
  const contentH   = numRows * ROW_H

  /* ── Click on empty timeline → add event ── */
  const handleTimelineClick = useCallback((e) => {
    if (e.target.closest('.event-block')) return
    const rect     = scrollRef.current.getBoundingClientRect()
    const x        = e.clientX - rect.left + scrollRef.current.scrollLeft
    const rawMins  = (x / HOUR_PX) * 60 + START_H * 60
    const snapped  = snapTo15(rawMins)
    const h        = Math.min(23, Math.floor(snapped / 60))
    const m        = snapped % 60
    onAddAtTime({ hour: h, minute: m })
  }, [onAddAtTime])

  /* ── Row separators (always rendered) ── */
  const rowSeparators = useMemo(() =>
    Array.from({ length: numRows }, (_, r) => (
      <div
        key={r}
        style={{
          position:   'absolute',
          top:        r * ROW_H,
          left:       0,
          width:      TIMELINE_W,
          height:     1,
          background: '#1A1610',
          pointerEvents: 'none',
        }}
      />
    )),
    [numRows]
  )

  /* ── Vertical hour grid lines ── */
  const gridLines = useMemo(() => {
    const lines = []
    for (let h = START_H; h <= Math.ceil(END_H); h++) {
      lines.push(
        <div
          key={h}
          style={{
            position:   'absolute',
            left:       (h - START_H) * HOUR_PX,
            top:        0,
            bottom:     0,
            width:      1,
            background: '#1E1A15',
            pointerEvents: 'none',
          }}
        />
      )
      // half-hour dashed
      if (h < Math.ceil(END_H)) {
        lines.push(
          <div
            key={`${h}.5`}
            style={{
              position:        'absolute',
              left:            (h - START_H + 0.5) * HOUR_PX,
              top:             0,
              bottom:          0,
              width:           1,
              background:      'repeating-linear-gradient(to bottom, #181410 0px, #181410 4px, transparent 4px, transparent 8px)',
              pointerEvents:   'none',
            }}
          />
        )
      }
    }
    return lines
  }, [])

  return (
    <div
      style={{
        flex:     1,
        display:  'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Left axis ── */}
      <div
        style={{
          width:      48,
          flexShrink: 0,
          background: '#0C0A08',
          borderRight:'1px solid #2A2520',
          zIndex:     5,
          display:    'flex',
          flexDirection: 'column',
        }}
      >
        {/* Ruler spacer */}
        <div style={{ height: RULER_H, flexShrink: 0, borderBottom: '1px solid #2A2520' }} />
        {/* Row lane labels */}
        {numRows > 1 && Array.from({ length: numRows }, (_, r) => (
          <div
            key={r}
            style={{
              height:         ROW_H,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              borderBottom:   '1px solid #1A1610',
            }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#2A2520' }}>
              {r + 1}
            </span>
          </div>
        ))}
      </div>

      {/* ── Scroll container ── */}
      <div
        ref={scrollRef}
        style={{
          flex:                   1,
          overflowX:              'auto',
          overflowY:              'auto',
          WebkitOverflowScrolling:'touch',
          scrollBehavior:         'smooth',
          position:               'relative',
        }}
        onClick={handleTimelineClick}
      >
        {/* Content: ruler + event rows */}
        <div
          style={{
            width:    TIMELINE_W,
            minHeight:'100%',
            position: 'relative',
            display:  'flex',
            flexDirection: 'column',
          }}
        >
          <TimeRuler isToday={isToday} currentX={isToday ? nowX : null} />

          {/* Event rows */}
          <div
            style={{
              position: 'relative',
              height:   contentH,
              flex:     1,
              minHeight:contentH,
            }}
          >
            {/* Grid lines */}
            {gridLines}

            {/* Row separators */}
            {rowSeparators}

            {/* Current time vertical line */}
            {isToday && nowX >= 0 && (
              <div
                style={{
                  position:     'absolute',
                  left:         nowX,
                  top:          0,
                  bottom:       0,
                  width:        1,
                  background:   '#C9A84C',
                  opacity:      0.6,
                  zIndex:       5,
                  pointerEvents:'none',
                }}
              />
            )}

            {/* Empty day message */}
            {events.length === 0 && (
              <div
                style={{
                  position:       'absolute',
                  top:            '50%',
                  left:           '50%',
                  transform:      'translate(-50%, -50%)',
                  textAlign:      'center',
                  pointerEvents:  'none',
                }}
              >
                <p className="font-cormorant italic" style={{ fontSize: '18px', color: 'var(--faint)' }}>
                  No events recorded.
                </p>
                <p
                  className="font-cinzel"
                  style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.18em', marginTop: 8, cursor: 'pointer', pointerEvents: 'auto' }}
                  onClick={() => onAddAtTime({ hour: 9, minute: 0 })}
                >
                  + Add the first event
                </p>
              </div>
            )}

            {/* Event blocks */}
            {visible.map((ev) => (
              <EventBlock
                key={ev.id}
                event={ev}
                activeFilter={activeFilter}
                onEdit={onEditEvent}
              />
            ))}
          </div>
        </div>

        {/* Mobile scroll hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position:      'fixed',
                bottom:        90,
                left:          '50%',
                transform:     'translateX(-50%)',
                fontFamily:    'JetBrains Mono, monospace',
                fontSize:      '10px',
                color:         'rgba(201,168,76,0.4)',
                letterSpacing: '0.12em',
                pointerEvents: 'none',
                zIndex:        10,
              }}
            >
              ← scroll →
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
