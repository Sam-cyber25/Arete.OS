import { useState }             from 'react'
import { ROW_H, EVENT_H, CAT_COLORS, CAT_LABELS, fmtRange } from './scheduleConstants'
import { useIsMobile }          from '../../hooks/useIsMobile'

/* ── Floating tooltip ── */
function EventTooltip({ event, color, label, timeRange, below, onEdit }) {
  const isMobile = useIsMobile()
  const posY     = below ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }

  return (
    <div
      style={{
        position:      'absolute',
        left:          0,
        ...posY,
        zIndex:        200,
        background:    '#1C1810',
        border:        `1px solid ${color}80`,
        padding:       '10px 14px',
        minWidth:      200,
        maxWidth:      280,
        pointerEvents: isMobile ? 'auto' : 'none',
        boxShadow:     '0 8px 32px rgba(0,0,0,0.7)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header row */}
      <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', color, letterSpacing: '0.12em' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--faint)' }}>
          {timeRange}
        </span>
      </div>

      {/* Title */}
      <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px', color: '#E8DFC8', lineHeight: 1.3 }}>
        {event.title}
      </p>

      {/* Note section */}
      {event.note && (
        <>
          <div style={{ height: 1, background: '#2A2520', margin: '8px 0 6px' }} />
          <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55 }}>
            {event.note}
          </p>
        </>
      )}

      {/* Mobile edit button */}
      {isMobile && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          style={{
            marginTop:     10,
            width:         '100%',
            padding:       '6px',
            background:    'rgba(201,168,76,0.08)',
            border:        '1px solid rgba(201,168,76,0.3)',
            color:         'var(--gold)',
            fontFamily:    'Cinzel, serif',
            fontSize:      '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor:        'pointer',
          }}
        >
          Edit
        </button>
      )}
    </div>
  )
}

/* ── Event block ── */
export default function EventBlock({ event, activeFilter, onEdit }) {
  const isMobile    = useIsMobile()
  const [active, setActive] = useState(false)

  const color      = CAT_COLORS[event.category] || '#4A3F32'
  const label      = CAT_LABELS[event.category]  || '[—]'
  const isFiltered = activeFilter !== 'ALL' && event.category !== activeFilter
  const timeRange  = fmtRange(event.startTime, event.duration)
  const x          = event._x
  const width      = event._w
  const narrow     = width < 80
  const top        = event._row * ROW_H + (ROW_H - EVENT_H) / 2
  const tooltipBelow = event._row === 0

  const handleMouseEnter = () => { if (!isMobile) setActive(true)  }
  const handleMouseLeave = () => { if (!isMobile) setActive(false) }

  const handleClick = (e) => {
    e.stopPropagation()
    if (isMobile) {
      setActive((p) => !p)
    } else {
      onEdit(event)
    }
  }

  return (
    <div
      style={{
        position:  'absolute',
        left:      x,
        top,
        width,
        height:    EVENT_H,
        zIndex:    active ? 100 : 1,
        opacity:   isFiltered ? 0.12 : 1,
        overflow:  'visible',
        transition:'opacity 0.18s',
        userSelect:'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* ── Main box ── */}
      <div
        style={{
          width:        '100%',
          height:       '100%',
          background:   active ? '#1C1810' : '#13110E',
          borderLeft:   `3px solid ${color}`,
          borderTop:    `1px solid ${active ? color : '#2A2520'}`,
          borderRight:  `1px solid ${active ? color : '#2A2520'}`,
          borderBottom: `1px solid ${active ? color : '#2A2520'}`,
          padding:      narrow ? '5px 4px' : '5px 8px 4px 8px',
          overflow:     'hidden',
          transform:    active ? 'scale(1.02)' : 'scale(1)',
          transformOrigin: 'center',
          transition:   'all 0.15s ease',
          boxShadow:    active ? `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${color}33` : 'none',
          cursor:       'pointer',
          borderRadius: 1,
          boxSizing:    'border-box',
        }}
      >
        {!narrow ? (
          <>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '7px', color, letterSpacing: '0.1em', lineHeight: 1, marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '13px', color: '#E8DFC8', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.title}
            </div>
            {width >= 130 && (
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#7A6A58', marginTop: 3, lineHeight: 1 }}>
                {timeRange}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '11px', color: '#E8DFC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: String(EVENT_H) + 'px' }}>
            {event.title}
          </div>
        )}
      </div>

      {/* ── Tooltip ── */}
      {active && (
        <EventTooltip
          event={event}
          color={color}
          label={label}
          timeRange={timeRange}
          below={tooltipBelow}
          onEdit={() => onEdit(event)}
        />
      )}
    </div>
  )
}
