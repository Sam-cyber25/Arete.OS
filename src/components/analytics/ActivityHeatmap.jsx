import { useState }         from 'react'
import { useApp }            from '../../context/AppContext'
import { getHeatmapData }    from '../../utils/dateHelpers'
import { format }            from 'date-fns'
import { useIsMobile }       from '../../hooks/useIsMobile'

export default function ActivityHeatmap() {
  const isMobile          = useIsMobile()
  const { tasks, notes }  = useApp()
  const [tooltip, setTooltip] = useState(null)
  const allData = getHeatmapData(tasks, notes)
  // Show only last 8 weeks on mobile, 12 on desktop
  const data    = isMobile ? allData.slice(-56) : allData

  const SQUARE  = isMobile ? 8 : 6
  const GAP     = isMobile ? 3 : 2

  const weeks = []
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7))

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const getColor = (count) => {
    if (count === 0) return 'var(--divider)'
    const t = Math.min(count / maxCount, 1)
    // interpolate from bronze to gold based on intensity
    if (t < 0.33) return 'rgba(139,115,85,0.5)'
    if (t < 0.66) return 'rgba(201,168,76,0.6)'
    return 'var(--gold)'
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col mt-6" style={{ gap: `${GAP}px` }}>
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className="font-mono flex items-center justify-center"
              style={{ width: SQUARE, height: SQUARE, fontSize: '7px', color: 'var(--faint)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex overflow-x-auto" style={{ gap: `${GAP}px` }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: `${GAP}px` }}>
              {/* Month label */}
              <div style={{ height: 20 }} className="flex items-center">
                {wi > 0 && week[0] && new Date(week[0].date).getDate() <= 7 && (
                  <span
                    className="font-cinzel"
                    style={{ fontSize: '7px', color: 'var(--faint)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                  >
                    {format(new Date(week[0].date), 'MMM').toUpperCase()}
                  </span>
                )}
              </div>
              {week.map((day, di) => (
                <div
                  key={di}
                  style={{
                    width:      SQUARE,
                    height:     SQUARE,
                    background: getColor(day.count),
                    cursor:     'pointer',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) =>
                    setTooltip({
                      text: `${format(new Date(day.date), 'MMM d, yyyy')} — ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`,
                      x:    e.clientX,
                      y:    e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 font-cinzel pointer-events-none"
          style={{
            left:          tooltip.x + 12,
            top:           tooltip.y - 28,
            background:    'var(--surface)',
            border:        '1px solid var(--border)',
            padding:       '5px 12px',
            fontSize:      '9px',
            color:         'var(--muted)',
            letterSpacing: '0.08em',
            whiteSpace:    'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="font-cinzel" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.08em' }}>
          LESS
        </span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            style={{
              width:      SQUARE,
              height:     SQUARE,
              background: getColor(Math.round(v * maxCount)),
            }}
          />
        ))}
        <span className="font-cinzel" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.08em' }}>
          MORE
        </span>
      </div>
    </div>
  )
}
