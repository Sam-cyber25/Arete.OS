import { motion }          from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useApp }           from '../context/AppContext'
import WeeklyBar            from '../components/analytics/WeeklyBar'
import GoalRadar            from '../components/analytics/GoalRadar'
import NotesLine            from '../components/analytics/NotesLine'
import ActivityHeatmap      from '../components/analytics/ActivityHeatmap'
import { getLongestStreak } from '../utils/dateHelpers'
import OrnamentalDivider    from '../components/layout/OrnamentalDivider'
import { useIsMobile }      from '../hooks/useIsMobile'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

/* ── Count-up animation hook ── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target) || target > 10000) {
      setValue(target)
      return
    }
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)   // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

/* ── Animated stat number ── */
function AnimatedStat({ value }) {
  const numericValue = typeof value === 'string' && value.endsWith('d')
    ? parseInt(value, 10)
    : typeof value === 'number' ? value : null

  const counted = useCountUp(numericValue ?? 0)

  if (numericValue === null) return <>{value}</>
  if (value.toString().endsWith('d')) return <>{counted}d</>
  return <>{counted}</>
}

function ChartCard({ title, subtitle, children, isMobile }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: isMobile ? '16px 12px' : 24 }}>
      <p className="section-label" style={{ marginBottom: (!isMobile && subtitle) ? 2 : 12 }}>{title}</p>
      {!isMobile && subtitle && (
        <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: 16 }}>
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
          tick={{ fontFamily: 'Cinzel, serif', fontSize: 9, fill: '#A89880', letterSpacing: 2 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#8A7D6E' }}
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
      <p className="font-cormorant italic" style={{ color: 'var(--muted)', fontSize: '15px' }}>
        Begin your disciplines.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {ranked.map((h, i) => (
        <div key={h.id} className="flex items-center gap-3">
          <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', color: 'var(--muted)', width: 16 }}>
            {i + 1}
          </span>
          <div style={{ flex: 1, height: 2, background: 'var(--divider)', position: 'relative', overflow: 'hidden' }}>
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
  const isMobile = useIsMobile()
  const {
    tasks, notes, goals, habits, todayScore,
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
    { label: "Today's Score",   value: todayScore, suffix: '%' },
  ]

  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '13px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}>
          Ratio
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Analytics
        </p>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Summary numbers — 4-col desktop, 2×2 mobile */}
      <div
        className="mb-8"
        style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
          border:              '1px solid var(--border)',
          background:          'var(--surface)',
        }}
      >
        {summaryStats.map((stat, i) => {
          const cols       = isMobile ? 2 : summaryStats.length
          const lastRowStart = summaryStats.length - (summaryStats.length % cols === 0 ? cols : summaryStats.length % cols)
          const isLastRow  = isMobile ? i >= lastRowStart : false
          const isLastCol  = (i + 1) % cols === 0 || i === summaryStats.length - 1
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center"
              style={{
                padding:     isMobile ? '16px 8px' : '24px',
                minHeight:   isMobile ? 80 : 'auto',
                borderRight:  !isLastCol ? '1px solid var(--divider)' : 'none',
                borderBottom: isMobile && !isLastRow ? '1px solid var(--divider)' : 'none',
              }}
            >
              <p className="font-mono" style={{ fontSize: isMobile ? '28px' : '36px', color: 'var(--gold)', lineHeight: 1 }}>
                <AnimatedStat value={stat.value} />{stat.suffix ?? ''}
              </p>
              <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.2em', marginTop: 6, textAlign: 'center' }}>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts grid — 2-col desktop, 1-col mobile */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap:                 isMobile ? 16 : 24,
          marginBottom:        isMobile ? 16 : 24,
        }}
      >
        <ChartCard title="Weekly Tasks" subtitle="Completed tasks per day, last 7 days" isMobile={isMobile}>
          <WeeklyBar />
        </ChartCard>
        <ChartCard title="Goal Progress" subtitle="Radar chart across all 6 domains" isMobile={isMobile}>
          <GoalRadar />
        </ChartCard>
      </div>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap:                 isMobile ? 16 : 24,
          marginBottom:        isMobile ? 24 : 32,
        }}
      >
        <ChartCard title="Notes per Week" subtitle="Memory entries over last 4 weeks" isMobile={isMobile}>
          <NotesLine />
        </ChartCard>
        <ChartCard title="Activity Heatmap" subtitle="Combined task and note activity, last 12 weeks" isMobile={isMobile}>
          <ActivityHeatmap />
        </ChartCard>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── DISCIPLINE ANALYTICS ── */}
      <div className="mb-8">
        <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '13px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4, marginTop: 32 }}>
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
          <span
            className="font-cormorant"
            style={{
              fontSize:  isMobile ? '48px' : '64px',
              color:     perfectDays > 0 ? 'var(--gold)' : 'var(--faint)',
              lineHeight: 1,
              fontWeight: 600,
              flexShrink: 0,
              marginLeft: 24,
            }}
          >
            <AnimatedStat value={perfectDays} />
          </span>
        </div>

        {/* Weekly habits bar + streak leaderboard */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap:                 isMobile ? 16 : 24,
          }}
        >
          <ChartCard title="Weekly Discipline Score" subtitle="% of habits completed, last 7 days" isMobile={isMobile}>
            <DisciplineWeekBar data={weeklyData} />
          </ChartCard>
          <ChartCard title="Streak Leaderboard" subtitle="Habits ranked by current streak" isMobile={isMobile}>
            <StreakLeaderboard habits={habits || []} getHabitStreak={getHabitStreak} />
          </ChartCard>
        </div>
      </div>
    </motion.div>
  )
}
