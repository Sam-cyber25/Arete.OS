import { motion }          from 'framer-motion'
import QuoteHero           from '../components/dashboard/QuoteHero'
import VoiceOfAncients     from '../components/dashboard/VoiceOfAncients'
import TodaysPriority      from '../components/dashboard/TodaysPriority'
import StatsRow            from '../components/dashboard/StatsRow'
import GoalSnapshot        from '../components/dashboard/GoalSnapshot'
import SchedulePreview     from '../components/dashboard/SchedulePreview'
import MemoryPreview       from '../components/dashboard/MemoryPreview'
import JournalStreak       from '../components/dashboard/JournalStreak'
import WeekAtAGlance       from '../components/dashboard/WeekAtAGlance'
import DisciplinesStrip    from '../components/dashboard/DisciplinesStrip'
import OrnamentalDivider   from '../components/layout/OrnamentalDivider'
import { useIsMobile }     from '../hooks/useIsMobile'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

export default function Dashboard() {
  const isMobile = useIsMobile()

  return (
    <motion.div
      {...PAGE}
      className="flex flex-col gap-4"
      style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 16px 0' : '0' }}
    >
      {/* ── Quote + streak row ── */}
      {isMobile ? (
        <>
          <QuoteHero />
          <JournalStreak />
        </>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2"><QuoteHero /></div>
          <JournalStreak />
        </div>
      )}

      <OrnamentalDivider opacity={0.15} />

      {/* ── Voice of the Ancients ── */}
      <VoiceOfAncients />

      <OrnamentalDivider opacity={0.15} />

      {/* ── Today's priority command ── */}
      <TodaysPriority />

      <OrnamentalDivider opacity={0.15} />

      {/* ── Stats ── */}
      <StatsRow />

      <OrnamentalDivider opacity={0.15} />

      {/* ── Week at a glance ── */}
      <WeekAtAGlance />

      <OrnamentalDivider opacity={0.15} />

      {/* ── Mobile: disciplines strip ── */}
      {isMobile && (
        <>
          <div className="card" style={{ padding: '16px 20px' }}>
            <DisciplinesStrip />
          </div>
          <OrnamentalDivider opacity={0.15} />
        </>
      )}

      {/* ── Goals + schedule ── */}
      {isMobile ? (
        <>
          <GoalSnapshot />
          <SchedulePreview />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <GoalSnapshot />
          <SchedulePreview />
        </div>
      )}

      <OrnamentalDivider opacity={0.15} />

      {/* ── Memory preview ── */}
      <MemoryPreview />
    </motion.div>
  )
}
