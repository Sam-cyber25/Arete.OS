import { motion }          from 'framer-motion'
import { useApp }           from '../context/AppContext'
import WeeklyBar            from '../components/analytics/WeeklyBar'
import GoalRadar            from '../components/analytics/GoalRadar'
import NotesLine            from '../components/analytics/NotesLine'
import ActivityHeatmap      from '../components/analytics/ActivityHeatmap'
import { getLongestStreak } from '../utils/dateHelpers'
import OrnamentalDivider    from '../components/layout/OrnamentalDivider'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 24 }}>
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

/* ── Discipline bar chart ── */
function DisciplineWeekBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="day"
          tick={{ fontFamily: 'Cinzel, serif', fontSize: 9, fill: '#8A7A65', letterSpacing: 2 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#4A3F32' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#13110E', border: '1px solid #2A2520', fontFamily: 'Cinzel, serif', fontSize: 10 }}
          labelStyle={{ color: '#C9A84C' }}
          itemStyle={{ color: '#F0EAD6' }}
          formatter={(v) => [`${v}%`, 'Score']}
        />
        <Bar dataKey="score" radius={[1, 1, 0, 0]} maxBarSize={32}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.score >= 80 ? '#C9A84C' : entry.score >= 50 ? '#8A7A65' : '#2A2520'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Streak leaderboard ── */
function StreakLeaderboard({ habits, getHabitStreak }) {
  const ranked = [...habits]
    .map((h) => ({ ...h, streak: getHabitStreak(h.id) }))
    .filter((h) => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 8)

  if (ranked.length === 0) {
    return (
      <p className="font-garamond italic" style={{ color: 'var(--muted)', fontSize: '14px' }}>
        No active streaks yet — start checking disciplines.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {ranked.map((h, i) => (
        <div key={h.id} className="flex items-center gap-3">
          <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', color: 'var(--faint)', width: 16 }}>
            {i + 1}
          </span>
          <div
            style={{ flex: 1, height: 2, background: 'var(--divider)', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position:   'absolute',
                left:       0,
                top:        0,
                height:     '100%',
                width:      `${Math.min(100, (h.streak / ranked[0].streak) * 100)}%`,
                background: 'var(--gold)',
                opacity:    0.6,
              }}
            />
          </div>
          <span className="font-garamond flex-shrink-0" style={{ fontSize: '14px', color: 'var(--text)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {h.name}
          </span>
          <span className="font-mono flex-shrink-0" style={{ fontSize: '11px', color: 'var(--gold)' }}>
            ↑{h.streak}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const {
    tasks, notes, goals, habits,
    getPerfectDays, getWeeklyCompletionData, getHabitStreak,
  } = useApp()

  const allActivityDates = [
    ...tasks.filter((t) => t.completedAt).map((t) => t.completedAt),
    ...notes.map((n) => n.createdAt),
  ]
  const longestStreak  = getLongestStreak(allActivityDates)
  const goalsAbove50   = goals.filter((g) => g.progress >= 50).length
  const completedTasks = tasks.filter((t) => t.completed).length
  const perfectDays    = getPerfectDays()
  const weeklyData     = getWeeklyCompletionData()

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
        <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}>
          Ratio
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Analytics
        </p>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Summary numbers */}
      <div className="grid grid-cols-4 gap-0 mb-8" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        {summaryStats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-6"
            style={{ borderRight: i < summaryStats.length - 1 ? '1px solid var(--divider)' : 'none' }}
          >
            <p className="font-mono" style={{ fontSize: '32px', color: 'var(--gold)', lineHeight: 1 }}>{stat.value}</p>
            <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginTop: 6 }}>
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

      <div className="grid grid-cols-2 gap-6 mb-8">
        <ChartCard title="Notes per Week" subtitle="Memory entries over last 4 weeks">
          <NotesLine />
        </ChartCard>
        <ChartCard title="Activity Heatmap" subtitle="Combined task and note activity, last 12 weeks">
          <ActivityHeatmap />
        </ChartCard>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── DISCIPLINE ANALYTICS ── */}
      <div className="mb-8">
        <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4, marginTop: 32 }}>
          Discipline Analytics
        </p>

        {/* Perfect Days hero */}
        <div
          className="flex items-center justify-between mb-6 p-6"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Perfect Days This Month</p>
            <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Days where all applicable disciplines were completed
            </p>
          </div>
          <span className="font-cormorant" style={{ fontSize: '64px', color: perfectDays > 0 ? 'var(--gold)' : 'var(--faint)', lineHeight: 1, fontWeight: 600, flexShrink: 0, marginLeft: 24 }}>
            {perfectDays}
          </span>
        </div>

        {/* Weekly habits bar + streak leaderboard */}
        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="Weekly Discipline Score" subtitle="% of habits completed, last 7 days">
            <DisciplineWeekBar data={weeklyData} />
          </ChartCard>
          <ChartCard title="Streak Leaderboard" subtitle="Habits ranked by current streak">
            <StreakLeaderboard habits={habits || []} getHabitStreak={getHabitStreak} />
          </ChartCard>
        </div>
      </div>
    </motion.div>
  )
}
