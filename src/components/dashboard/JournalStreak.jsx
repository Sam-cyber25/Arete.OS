import { motion }  from 'framer-motion'
import { useApp }   from '../../context/AppContext'
import { getHeatmapData } from '../../utils/dateHelpers'
import { format, isSameDay, addDays, startOfDay } from 'date-fns'

export default function JournalStreak() {
  const { tasks, notes, journalStreak, setCurrentPage } = useApp()

  // Mini heatmap — last 6 weeks, one row
  const weeks  = 6
  const today  = startOfDay(new Date())
  const start  = addDays(today, -(weeks * 7 - 1))
  const heatData = getHeatmapData(tasks, notes)
  const recent   = heatData.slice(-42) // last 6 weeks

  const maxCount = Math.max(...recent.map((d) => d.count), 1)

  const getOpacity = (count) => {
    if (count === 0) return 0.08
    return 0.2 + (count / maxCount) * 0.8
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.45 }}
      className="card flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <p className="section-label">Journal Streak</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('journal')}
        >
          Open Journal
        </button>
      </div>

      <div className="text-center mb-2">
        <span
          className="font-cormorant italic"
          style={{ fontSize: '42px', color: 'var(--text)', lineHeight: 1 }}
        >
          {journalStreak}
        </span>
        <p
          className="font-cinzel uppercase mt-2"
          style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em' }}
        >
          Days of Reflection
        </p>
      </div>

      {/* Mini heatmap */}
      <div className="flex gap-1 flex-wrap">
        {recent.map((day, i) => (
          <div
            key={i}
            title={format(new Date(day.date), 'MMM d')}
            style={{
              width: 8, height: 8,
              background: 'var(--gold)',
              opacity:    getOpacity(day.count),
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
