import { HOUR_PX, RULER_H, START_H, END_H, TIMELINE_W } from './scheduleConstants'

function fmtHour(h) {
  if (h === 0 || h === 24) return '12 AM'
  if (h === 12)            return '12 PM'
  if (h < 12)              return `${h} AM`
  return `${h - 12} PM`
}

export default function TimeRuler({ isToday, currentX }) {
  const hours = []
  for (let h = START_H; h <= Math.ceil(END_H); h++) hours.push(h)

  return (
    <div
      style={{
        position:     'sticky',
        top:          0,
        zIndex:       10,
        height:       RULER_H,
        width:        TIMELINE_W,
        background:   '#0C0A08',
        borderBottom: '1px solid #2A2520',
        flexShrink:   0,
      }}
    >
      {/* Hour ticks + labels */}
      {hours.map((h) => {
        const x = (h - START_H) * HOUR_PX
        return (
          <div key={h} style={{ position: 'absolute', left: x }}>
            {/* Vertical tick */}
            <div style={{
              position: 'absolute', left: 0, bottom: 0,
              width: 1, height: 8, background: '#2A2520',
            }} />
            {/* Label */}
            <span style={{
              position:   'absolute',
              left:       4,
              top:        8,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize:   '10px',
              color:      '#7A6A58',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              {fmtHour(h)}
            </span>
          </div>
        )
      })}

      {/* Half-hour ticks */}
      {hours.slice(0, -1).map((h) => (
        <div key={`h${h}`} style={{
          position: 'absolute',
          left:     (h - START_H + 0.5) * HOUR_PX,
          bottom:   0, width: 1, height: 4,
          background: '#1E1A15',
        }} />
      ))}

      {/* Quarter-hour ticks */}
      {hours.slice(0, -1).flatMap((h) =>
        [0.25, 0.75].map((fr) => (
          <div key={`q${h}.${fr}`} style={{
            position: 'absolute',
            left:     (h - START_H + fr) * HOUR_PX,
            bottom:   0, width: 1, height: 2,
            background: '#1E1A15',
            opacity:  0.35,
          }} />
        ))
      )}

      {/* Current time — circle at ruler bottom */}
      {isToday && currentX !== null && currentX >= 0 && currentX <= TIMELINE_W && (
        <div style={{
          position:     'absolute',
          left:         currentX - 3,
          bottom:       -3,
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   '#C9A84C',
          opacity:      0.8,
          zIndex:       12,
          pointerEvents:'none',
        }} />
      )}
    </div>
  )
}
