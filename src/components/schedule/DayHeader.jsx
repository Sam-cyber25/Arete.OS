import { format } from 'date-fns'

const TODAY_STR = format(new Date(), 'yyyy-MM-dd')
const TOTAL_SCHED_MINS = 18.5 * 60  // 5 AM – 11:30 PM

export default function DayHeader({ date, events, onAddEvent }) {
  const dayName  = format(new Date(date + 'T00:00:00'), 'EEEE')  // "Monday"
  const isToday  = date === TODAY_STR
  const count    = events.length

  const scheduledMins = events.reduce((s, e) => s + (e.duration || 0), 0)
  const pct = Math.min(100, Math.round((scheduledMins / TOTAL_SCHED_MINS) * 100))

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
              style={{
                fontSize:      '7px',
                letterSpacing: '0.22em',
                color:         '#0C0A08',
                background:    'var(--gold)',
                padding:       '2px 7px',
                lineHeight:    1.8,
              }}
            >
              TODAY
            </span>
          )}
        </div>

        {/* Right: event count + add button */}
        <div className="flex items-center gap-4">
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'var(--faint)' }}
          >
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
            position:     'absolute',
            left:         0,
            top:          0,
            height:       '100%',
            width:        `${pct}%`,
            background:   'rgba(201,168,76,0.4)',
            transition:   'width 0.4s ease',
          }}
        />
        {pct > 0 && (
          <span
            className="font-mono"
            style={{
              position:   'absolute',
              right:      8,
              top:        4,
              fontSize:   '9px',
              color:      'var(--faint)',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            {pct}% scheduled
          </span>
        )}
      </div>
    </div>
  )
}
