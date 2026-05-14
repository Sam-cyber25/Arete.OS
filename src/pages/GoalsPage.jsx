import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../context/AppContext'
import GoalCard                     from '../components/goals/GoalCard'
import TaskList                     from '../components/goals/TaskList'
import AddGoalModal                 from '../components/goals/AddGoalModal'
import OrnamentalDivider            from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const TABS = [
  { id: 'goals', label: 'Goals'  },
  { id: 'tasks', label: 'Tasks'  },
]

export default function GoalsPage() {
  const { goals }                     = useApp()
  const [tab, setTab]                 = useState('goals')
  const [goalModal, setGoalModal]     = useState(false)

  const activeGoals = goals.filter((g) => g.status === 'Active').length

  return (
    <motion.div {...PAGE} style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="font-cinzel uppercase tracking-widest"
            style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}
          >
            Conquest
          </p>
          <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
            Goals & Tasks
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {activeGoals} active
          </p>
          {tab === 'goals' && (
            <button className="btn-primary" onClick={() => setGoalModal(true)}>
              New Goal
            </button>
          )}
        </div>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Tabs */}
      <div className="flex gap-6 mb-8" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="font-cinzel uppercase transition-colors"
            style={{
              fontSize:      '10px',
              letterSpacing: '0.2em',
              color:         tab === t.id ? 'var(--gold)' : 'var(--muted)',
              paddingBottom: 12,
              borderBottom:  tab === t.id ? '1px solid var(--gold)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'goals' ? (
          <motion.div
            key="goals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <AnimatePresence mode="popLayout">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TaskList />
          </motion.div>
        )}
      </AnimatePresence>

      <AddGoalModal open={goalModal} onClose={() => setGoalModal(false)} />
    </motion.div>
  )
}
