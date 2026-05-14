import { useRef, useEffect, useState } from 'react'
import { format, isSameDay, isToday }  from 'date-fns'
import { useApp }                       from '../../context/AppContext'
import EventBlock                       from './EventBlock'
import { getWeekDays }                  from '../../utils/dateHelpers'

const HOUR_HEIGHT = 52
const START_HOUR  = 6
const END_HOUR    = 23

export default function WeekGrid({ weekOffset, onSlotClick }) {
  const { events }                      = useApp()
  const nowLineRef                      = useRef(null)
  const [currentTime, setCurrentTime]   = useState(new Date())

  const days  = getWeekDays(weekOffset)
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    nowLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const getNowLineTop = () => {
    const h = currentTime.getHours()
    const m = currentTime.getMinutes()
    if (h < START_HOUR || h > END_HOUR) return null
    return ((h - START_HOUR) + m / 60) * HOUR_HEIGHT
  }

  const getEventStyle = (event) => {
    const start = new Date(event.startTime)
    const startH = start.getHours() + start.getMinutes() / 60
    if (startH < START_HOUR || startH > END_HOUR) return null
    return {
      top:    (startH - START_HOUR) * HOUR_HEIGHT,
      height: Math.max((event.duration / 60) * HOUR_HEIGHT, 28),
    }
  }

  const nowTop = getNowLineTop()

  return (
    <div className="flex overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      {/* Time labels */}
      <div className="flex-shrink-0" style={{ width: 52 }}>
        <div style={{ height: 44 }} />
        {hours.map((h) => (
          <div
            key={h}
            className="flex items-start justify-end pr-3 pt-1"
            style={{ height: HOUR_HEIGHT }}
          >
            <span
              className="font-mono"
              style={{ fontSize: '9px', color: 'var(--faint)' }}
            >
              {format(new Date().setHours(h, 0, 0, 0), 'h a')}
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex flex-1" style={{ gap: 0 }}>
        {days.map((day, di) => {
          const isCurrentDay = isToday(day)
          const dayEvents    = events.filter((e) => isSameDay(new Date(e.startTime), day))

          return (
            <div
              key={di}
              className="flex-1 min-w-0 relative"
              style={{ borderLeft: '1px solid var(--divider)' }}
            >
              {/* Day header */}
              <div
                className="sticky top-0 z-10 flex flex-col items-center justify-center"
                style={{
                  height:       44,
                  background:   'var(--bg)',
                  borderBottom: '1px solid var(--divider)',
                }}
              >
                <span
                  className="font-cinzel uppercase"
                  style={{
                    fontSize:      '8px',
                    letterSpacing: '0.15em',
                    color:         isCurrentDay ? 'var(--gold)' : 'var(--faint)',
                  }}
                >
                  {format(day, 'EEE')}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '14px',
                    color:    isCurrentDay ? 'var(--gold)' : 'var(--muted)',
                  }}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Hour slots */}
              <div className="relative">
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{
                      height:       HOUR_HEIGHT,
                      borderBottom: '1px solid var(--divider)',
                      cursor:       'pointer',
                    }}
                    onClick={() => {
                      const d = new Date(day)
                      d.setHours(h, 0, 0, 0)
                      onSlotClick(d)
                    }}
                  />
                ))}

                {/* Now line — thin gold, no glow */}
                {isCurrentDay && nowTop !== null && (
                  <div
                    ref={nowLineRef}
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div
                      style={{ height: 1, width: '100%', background: 'var(--gold)', opacity: 0.7 }}
                    />
                    <div
                      style={{
                        width:      4,
                        height:     4,
                        borderRadius: '50%',
                        background: 'var(--gold)',
                        position:   'absolute',
                        left:       -2,
                        top:        -2,
                      }}
                    />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((ev) => {
                  const s = getEventStyle(ev)
                  if (!s) return null
                  return (
                    <EventBlock
                      key={ev.id}
                      event={ev}
                      style={{ top: s.top, height: s.height, position: 'absolute', left: 0, right: 0 }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
