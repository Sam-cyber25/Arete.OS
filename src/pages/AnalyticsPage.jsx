import { motion }          from 'framer-motion'
import { useApp }           from '../context/AppContext'
import WeeklyBar            from '../components/analytics/WeeklyBar'
import GoalRadar            from '../components/analytics/GoalRadar'
import NotesLine            from '../components/analytics/NotesLine'
import ActivityHeatmap      from '../components/analytics/ActivityHeatmap'
import { getLongestStreak } from '../utils/dateHelpers'
import OrnamentalDivider    from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        border:       '1px solid var(--border)',
        background:   'var(--surface)',
        padding:      24,
      }}
    >
      <p className="section-label" style={{ marginBottom: subtitle ? 2 : 16 }}>{title}</p>
      {subtitle && (
        <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--faint)', marginBottom: 16 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const { tasks, notes, goals } = useApp()

  const allActivityDates = [
    ...tasks.filter((t) => t.completedAt).map((t) => t.completedAt),
    ...notes.map((n) => n.createdAt),
  ]
  const longestStreak = getLongestStreak(allActivityDates)
  const goalsAbove50  = goals.filter((g) => g.progress >= 50).length
  const completedTasks = tasks.filter((t) => t.completed).length

  const summaryStats = [
    { label: 'Tasks Completed', value: completedTasks },
    { label: 'Longest Streak',  value: `${longestStreak}d` },
    { label: 'Total Notes',     value: notes.length },
    { label: 'Goals 50%+',      value: goalsAbove50 },
  ]

  return (
    <motion.div {...PAGE} style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="font-cinzel uppercase tracking-widest"
          style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}
        >
          Ratio
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Analytics
        </p>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Summary numbers */}
      <div
        className="grid grid-cols-4 gap-0 mb-8"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {summaryStats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-6"
            style={{
              borderRight: i < summaryStats.length - 1 ? '1px solid var(--divider)' : 'none',
            }}
          >
            <p className="font-mono" style={{ fontSize: '32px', color: 'var(--gold)', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p
              className="font-cinzel uppercase"
              style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginTop: 6 }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <ChartCard title="Weekly Tasks" subtitle="Completed tasks per day, last 7 days">
          <WeeklyBar />
        </ChartCard>
        <ChartCard title="Goal Progress" subtitle="Radar chart across all 6 domains">
          <GoalRadar />
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Notes per Week" subtitle="Memory entries over last 4 weeks">
          <NotesLine />
        </ChartCard>
        <ChartCard title="Activity Heatmap" subtitle="Combined task and note activity, last 12 weeks">
          <ActivityHeatmap />
        </ChartCard>
      </div>
    </motion.div>
  )
}
