import { motion }  from 'framer-motion'
import { useApp }   from '../../context/AppContext'
import { format, startOfWeek, addDays, isToday, isFuture } from 'date-fns'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function scoreToColor(score) {
  if (score === 0) return '#1A1610'
  const t = score / 100
  const r = Math.round(0x1A + t * (0xC9 - 0x1A))
  const g = Math.round(0x16 + t * (0xA8 - 0x16))
  const b = Math.round(0x10 + t * (0x4C - 0x10))
  return `rgb(${r},${g},${b})`
}

export default function WeekAtAGlance() {
  const { getWeeklyCompletionData } = useApp()

  const weekData   = getWeeklyCompletionData()
  const weekStart  = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays   = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="card"
      style={{ padding: '20px 24px' }}
    >
      <p className="section-label" style={{ marginBottom: 14 }}>Week at a Glance</p>

      <div className="flex gap-2">
        {weekDays.map((day, i) => {
          const now      = isToday(day)
          const future   = isFuture(day) && !now
          const dayData  = weekData[i]
          const score    = dayData?.score ?? 0
          const bgColor  = future ? '#1A1610' : scoreToColor(score)

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 flex-1"
              style={{ minWidth: 0 }}
            >
              <span
                className="font-cinzel"
                style={{ fontSize: '8px', color: now ? 'var(--gold)' : 'var(--faint)', letterSpacing: '0.1em' }}
              >
                {DAY_LETTERS[i]}
              </span>
              <div
                style={{
                  width:     '100%',
                  aspectRatio: '1',
                  background: bgColor,
                  border:    now ? '1px solid var(--gold)' : '1px solid var(--border)',
                  transition: 'background 0.4s ease',
                  display:   'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!future && score > 0 && (
                  <span
                    className="font-mono"
                    style={{ fontSize: '8px', color: score >= 80 ? '#0C0A08' : 'var(--muted)', letterSpacing: 0 }}
                  >
                    {score}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
