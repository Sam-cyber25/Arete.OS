import { motion }     from 'framer-motion'
import { isToday }    from 'date-fns'
import { useApp }     from '../../context/AppContext'
import { formatHourMin } from '../../utils/dateHelpers'

export default function SchedulePreview() {
  const { events, setCurrentPage } = useApp()
  const now = new Date()

  const upcoming = events
    .filter((e) => isToday(new Date(e.startTime)) && new Date(e.startTime) >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45 }}
      className="card flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <p className="section-label">Today</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('schedule')}
        >
          Schedule
        </button>
      </div>

      {upcoming.length === 0 ? (
        <p className="font-garamond italic" style={{ color: 'var(--muted)', fontSize: '15px' }}>
          No upcoming events.
        </p>
      ) : (
        <div className="flex flex-col" style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div
            className="absolute top-2 bottom-2"
            style={{ left: 0, width: '1px', background: 'var(--border)' }}
          />
          <div className="flex flex-col gap-5" style={{ paddingLeft: 20 }}>
            {upcoming.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                style={{ position: 'relative' }}
              >
                {/* Gold dot on timeline */}
                <div
                  style={{
                    position: 'absolute', left: -24, top: 5,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--gold)', opacity: 0.7,
                  }}
                />
                <p
                  className="font-garamond"
                  style={{ color: 'var(--text)', fontSize: '15px', marginBottom: 2 }}
                >
                  {ev.title}
                </p>
                <p
                  className="font-mono"
                  style={{ color: 'var(--muted)', fontSize: '11px' }}
                >
                  {formatHourMin(ev.startTime)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
