import { motion }   from 'framer-motion'
import { useApp }    from '../../context/AppContext'

export default function DisciplinesStrip() {
  const { habits, todayCompletions, applicableToday, toggleHabit, setCurrentPage } = useApp()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">Today's Disciplines</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('disciplines')}
        >
          All
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: 4 }}>
        {applicableToday.map((habit) => {
          const done = !!todayCompletions[habit.id]
          return (
            <motion.button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center flex-shrink-0"
              style={{ gap: 5, minWidth: 52 }}
            >
              {/* Circle */}
              <div
                style={{
                  width:        36,
                  height:       36,
                  borderRadius: '50%',
                  border:       `1px solid ${done ? 'var(--gold)' : '#8A7A65'}`,
                  background:   done ? 'rgba(201,168,76,0.15)' : 'transparent',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  transition:   'all 0.2s ease',
                  flexShrink:   0,
                }}
              >
                <span style={{ fontSize: '13px', color: done ? 'var(--gold)' : 'var(--faint)', lineHeight: 1 }}>
                  {done ? '✦' : '◇'}
                </span>
              </div>
              {/* Name abbreviated */}
              <span
                className="font-cinzel uppercase text-center"
                style={{
                  fontSize:      '6px',
                  letterSpacing: '0.08em',
                  color:         done ? 'var(--gold)' : 'var(--faint)',
                  lineHeight:    1.3,
                  maxWidth:      52,
                  overflow:      'hidden',
                  display:       '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {habit.name.split(' ')[0]}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
