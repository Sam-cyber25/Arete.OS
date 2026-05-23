import { useState, useMemo }                        from 'react'
import { format, addDays, startOfWeek }             from 'date-fns'
import { getEventsForDate }                         from './scheduleConstants'
import { useIsMobile }                              from '../../hooks/useIsMobile'

const TODAY      = format(new Date(), 'yyyy-MM-dd')
const DAY_ABBRS  = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function toDateStr(date) {
  return format(date, 'yyyy-MM-dd')
}

/* Day summary tooltip */
function DaySummary({ dayEvts }) {
  const total  = dayEvts.length
  const hours  = (dayEvts.reduce((s, e) => s + (e.duration || 0), 0) / 60).toFixed(1)
  const first3 = dayEvts.slice(0, 3).map((e) => e.title)

  return (
    <div
      style={{
        position:      'absolute',
        top:           '100%',
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        60,
        background:    '#13110E',
        border:        '1px solid #2A2520',
        padding:       '10px 14px',
        minWidth:      160,
        pointerEvents: 'none',
        marginTop:     4,
      }}
    >
      <p className="font-mono" style={{ fontSize: '10px', color: 'var(--gold)', marginBottom: 6 }}>
        {total} event{total !== 1 ? 's' : ''} · {hours}h
      </p>
      {first3.map((t, i) => (
        <p
          key={i}
          className="font-garamond"
          style={{
            fontSize:     '12px',
            color:        'var(--muted)',
            lineHeight:   1.4,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            maxWidth:     180,
          }}
        >
          {t}
        </p>
      ))}
      {total === 0 && (
        <p className="font-garamond italic" style={{ fontSize: '12px', color: 'var(--faint)' }}>No events</p>
      )}
    </div>
  )
}

export default function WeekStrip({ selectedDate, onSelectDate, events }) {
  const isMobile   = useIsMobile()
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(selectedDate + 'T00:00:00'), { weekStartsOn: 1 })
  )
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const days       = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const monthLabel = format(addDays(weekStart, 3), isMobile ? 'MMM yyyy' : 'MMMM, yyyy')

  /* Pre-compute events for each of the 7 visible days — NO hooks in loops */
  const weekEvts = useMemo(
    () => days.map((day) => getEventsForDate(events, toDateStr(day))),
    [events, days]
  )

  const prevWeek = () => setWeekStart((ws) => addDays(ws, -7))
  const nextWeek = () => setWeekStart((ws) => addDays(ws,  7))

  const STRIP_H = isMobile ? 88 : 72

  return (
    <div
      style={{
        height:       STRIP_H,
        flexShrink:   0,
        display:      'flex',
        background:   '#0C0A08',
        borderBottom: '1px solid #2A2520',
      }}
    >
      {/* ── Left panel — desktop only ── */}
      {!isMobile && (
        <div
          style={{
            width:           200,
            flexShrink:      0,
            padding:         '0 20px',
            display:         'flex',
            flexDirection:   'column',
            justifyContent:  'center',
            borderRight:     '1px solid #2A2520',
          }}
        >
          <p className="font-cinzel uppercase" style={{ fontSize: '7px', color: 'var(--faint)', letterSpacing: '0.25em', marginBottom: 4 }}>
            Calendarium
          </p>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 4px' }}>
              ←
            </button>
            <p className="font-cormorant italic" style={{ fontSize: '17px', color: 'var(--text)', flex: 1, textAlign: 'center' }}>
              {monthLabel}
            </p>
            <button onClick={nextWeek} style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 4px' }}>
              →
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile month + week nav ── */}
      {isMobile && (
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            paddingBottom:  8,
            position:       'absolute',
            top:            4,
            left:           12,
            right:          12,
            pointerEvents:  'none',
            zIndex:         2,
          }}
        >
          <button
            onClick={prevWeek}
            style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '4px 6px', pointerEvents: 'all' }}
          >
            ←
          </button>
          <span className="font-cinzel" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em' }}>
            {monthLabel}
          </span>
          <button
            onClick={nextWeek}
            style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '4px 6px', pointerEvents: 'all' }}
          >
            →
          </button>
        </div>
      )}

      {/* ── Day columns ── */}
      <div className="flex flex-1" style={isMobile ? { paddingTop: 24 } : undefined}>
        {days.map((day, idx) => {
          const dateStr    = toDateStr(day)
          const isToday    = dateStr === TODAY
          const isSelected = dateStr === selectedDate
          const dayEvts    = weekEvts[idx]
          const hasEvents  = dayEvts.length > 0
          const dow        = day.getDay()

          return (
            <div
              key={dateStr}
              style={{ flex: 1, minWidth: isMobile ? 52 : 'auto', position: 'relative' }}
              onMouseEnter={() => !isMobile && setHoveredIdx(idx)}
              onMouseLeave={() => !isMobile && setHoveredIdx(null)}
            >
              <button
                onClick={() => onSelectDate(dateStr)}
                style={{
                  width:           '100%',
                  height:          '100%',
                  background:      isSelected ? 'rgba(201,168,76,0.06)' : 'transparent',
                  border:          'none',
                  borderBottom:    isSelected ? '2px solid var(--gold)' : '2px solid transparent',
                  borderRight:     idx < 6 ? '1px solid #1A1610' : 'none',
                  cursor:          'pointer',
                  display:         'flex',
                  flexDirection:   'column',
                  alignItems:      'center',
                  justifyContent:  'center',
                  gap:             isMobile ? 4 : 2,
                  padding:         isMobile ? '8px 4px 6px' : '4px 0 2px',
                  position:        'relative',
                  transition:      'background 0.15s',
                }}
              >
                {isToday && !isSelected && (
                  <span style={{ fontSize: '8px', color: 'var(--gold)', lineHeight: 1 }}>◆</span>
                )}

                <span
                  className="font-cinzel"
                  style={{
                    fontSize:      isMobile ? '7px' : '8px',
                    letterSpacing: '0.14em',
                    color:         isSelected ? 'var(--gold)' : isToday ? '#E8DFC8' : 'var(--faint)',
                    lineHeight:    1,
                  }}
                >
                  {DAY_ABBRS[dow]}
                </span>

                <span
                  className="font-cormorant"
                  style={{
                    fontSize:   isMobile ? '24px' : '22px',
                    color:      isSelected ? 'var(--gold)' : isToday ? '#E8DFC8' : 'var(--text)',
                    lineHeight: 1,
                    fontWeight: isSelected ? 600 : 400,
                    marginTop:  isMobile ? 2 : 0,
                  }}
                >
                  {format(day, 'd')}
                </span>

                {hasEvents && (
                  <div style={{
                    width:        3,
                    height:       3,
                    borderRadius: '50%',
                    background:   isSelected ? 'var(--gold)' : 'rgba(201,168,76,0.5)',
                    marginTop:    1,
                  }} />
                )}
              </button>

              {!isMobile && hoveredIdx === idx && <DaySummary dayEvts={dayEvts} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
