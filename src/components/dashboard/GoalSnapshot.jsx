import { motion } from 'framer-motion'
import { useApp }  from '../../context/AppContext'

export default function GoalSnapshot() {
  const { goals, setCurrentPage } = useApp()
  const topGoals = goals.filter((g) => g.status === 'Active').slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.45 }}
      className="card card-gold-top flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <p className="section-label">Active Goals</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('goals')}
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {topGoals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="font-cormorant"
                style={{ fontSize: '17px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}
              >
                {goal.title}
              </p>
              <span
                className="font-mono"
                style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0, marginLeft: 12 }}
              >
                {goal.progress}%
              </span>
            </div>
            <p
              className="font-cinzel uppercase mb-2"
              style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.16em' }}
            >
              {goal.category}
            </p>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
