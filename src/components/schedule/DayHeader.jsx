import { format } from 'date-fns'
import { useIsMobile } from '../../hooks/useIsMobile'

const TODAY_STR = format(new Date(), 'yyyy-MM-dd')
const TOTAL_SCHED_MINS = 18.5 * 60  // 5 AM – 11:30 PM

export default function DayHeader({ date, events, onAddEvent }) {
  const isMobile = useIsMobile()
  const dayName  = format(new Date(date + 'T00:00:00'), 'EEEE')
  const isToday  = date === TODAY_STR
  const count    = events.length

  const scheduledMins = events.reduce((s, e) => s + (e.duration || 0), 0)
  const pct = TOTAL_SCHED_MINS > 0
    ? Math.min(100, Math.round((scheduledMins / TOTAL_SCHED_MINS) * 100))
    : 0

  if (isMobile) {
    return (
      <div
        style={{
          flexShrink:   0,
          background:   'transparent',
          borderBottom: '1px solid #1E1A15',
          padding:      '12px 16px 0',
        }}
      >
        {/* Day name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span
            className="font-cormorant italic"
            style={{ fontSize: '28px', color: 'var(--text)', lineHeight: 1, fontWeight: 500 }}
          >
            {dayName}
          </span>
          {isToday && (
            <span
              className="font-cinzel"
              style={{ fontSize: '7px', letterSpacing: '0.22em', color: '#0C0A08', background: 'var(--gold)', padding: '2px 7px', lineHeight: 1.8 }}
            >
              TODAY
            </span>
          )}
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', marginLeft: 'auto' }}>
            {count} {count === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Full-width add button */}
        <button
          onClick={onAddEvent}
          className="font-cinzel"
          style={{
            width:         '100%',
            height:        44,
            fontSize:      '9px',
            letterSpacing: '0.22em',
            color:         'var(--gold)',
            background:    'none',
            border:        '1px solid rgba(201,168,76,0.35)',
            cursor:        'pointer',
            textTransform: 'uppercase',
            marginBottom:  8,
          }}
        >
          + Add Event
        </button>

        {/* Progress bar */}
        <div style={{ height: 2, background: '#1A1610' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(201,168,76,0.4)', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink:   0,
        background:   'transparent',
        borderBottom: '1px solid #1E1A15',
      }}
    >
      {/* Main row */}
      <div
        style={{
          height:         52,
          padding:        '0 24px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: day name + TODAY badge */}
        <div className="flex items-center gap-3">
          <span
            className="font-cormorant italic"
            style={{ fontSize: '28px', color: 'var(--text)', lineHeight: 1, fontWeight: 500 }}
          >
            {dayName}
          </span>
          {isToday && (
            <span
              className="font-cinzel"
              style={{ fontSize: '7px', letterSpacing: '0.22em', color: '#0C0A08', background: 'var(--gold)', padding: '2px 7px', lineHeight: 1.8 }}
            >
              TODAY
            </span>
          )}
        </div>

        {/* Right: event count + add button */}
        <div className="flex items-center gap-4">
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>
            {count} {count === 1 ? 'event' : 'events'}
          </span>
          <button
            onClick={onAddEvent}
            className="font-cinzel"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.22em',
              color:         'var(--gold)',
              background:    'none',
              border:        '1px solid rgba(201,168,76,0.45)',
              padding:       '5px 14px',
              cursor:        'pointer',
              textTransform: 'uppercase',
              transition:    'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', height: 2, background: '#1A1610' }}>
        <div
          style={{
            position:   'absolute',
            left:       0,
            top:        0,
            height:     '100%',
            width:      `${pct}%`,
            background: 'rgba(201,168,76,0.4)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
