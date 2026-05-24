import { motion }  from 'framer-motion'
import { useApp }   from '../../context/AppContext'
import { isToday }  from 'date-fns'

export default function TodaysPriority() {
  const { tasks, setCurrentPage } = useApp()

  /* First incomplete HIGH priority task due today (or any high priority today) */
  const top = tasks.find(
    (t) => !t.completed
      && t.priority === 'high'
      && t.dueDate
      && isToday(new Date(t.dueDate))
  )
  /* Fallback: any incomplete high priority */
  const fallback = !top
    ? tasks.find((t) => !t.completed && t.priority === 'high')
    : null

  const task = top || fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.45 }}
      className="card"
      style={{ padding: '24px 28px', borderTop: '1px solid rgba(201,168,76,0.2)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Command for Today</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('goals')}
        >
          Tasks
        </button>
      </div>

      {task ? (
        <p
          className="font-cormorant italic"
          style={{ fontSize: '22px', color: 'var(--text)', lineHeight: 1.5, maxWidth: 600 }}
        >
          {task.title}
        </p>
      ) : (
        <p
          className="font-garamond italic"
          style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.6 }}
        >
          No high priority set — add one to anchor the day.
        </p>
      )}

      {task && (
        <p className="font-cinzel uppercase mt-3" style={{ fontSize: '12px', color: '#E8A87C', letterSpacing: '0.2em' }}>
          ✦ High Priority
        </p>
      )}
    </motion.div>
  )
}
