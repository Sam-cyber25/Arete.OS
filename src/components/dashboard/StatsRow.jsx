import { motion } from 'framer-motion'
import { useApp }  from '../../context/AppContext'

function StatCard({ label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card flex flex-col items-center justify-center"
      style={{ padding: '28px 20px', textAlign: 'center', flex: 1 }}
    >
      <span
        className="font-mono"
        style={{ fontSize: '36px', color: 'var(--gold)', lineHeight: 1, marginBottom: 10 }}
      >
        {value}
      </span>
      <span
        className="font-cinzel uppercase tracking-widest"
        style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em' }}
      >
        {label}
      </span>
    </motion.div>
  )
}

export default function StatsRow() {
  const { tasksCompletedToday, goals, notesThisWeek, streak } = useApp()
  const activeGoals = goals.filter((g) => g.status === 'Active').length

  return (
    <div className="flex gap-4">
      <StatCard label="Tasks Done Today"  value={tasksCompletedToday} delay={0.05} />
      <StatCard label="Active Goals"      value={activeGoals}         delay={0.10} />
      <StatCard label="Notes This Week"   value={notesThisWeek}       delay={0.15} />
      <StatCard label="Day Streak"        value={streak?.count || 1}  delay={0.20} />
    </div>
  )
}
