import { useState, useEffect } from 'react'
import { useApp }              from '../../context/AppContext'
import { formatTime, formatDate } from '../../utils/dateHelpers'
import OrnamentalDivider       from './OrnamentalDivider'
import { useIsMobile }         from '../../hooks/useIsMobile'

const PAGE_TITLES = {
  dashboard:   'Overview',
  goals:       'Goals & Tasks',
  disciplines: 'Disciplines',
  memory:      'Memory',
  analytics:   'Analytics',
  schedule:    'Schedule',
  journal:     'Journal',
  planner:     'Planner',
  whiteboard:  'Whiteboard',
  stickynotes: 'Sticky Notes',
  settings:    'Settings',
}

export default function Header() {
  const { settings, currentPage, todayScore, setCurrentPage } = useApp()
  const [time, setTime] = useState(new Date())
  const isMobile        = useIsMobile()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const name  = settings?.userName || 'Sam'
  const title = PAGE_TITLES[currentPage] || 'Overview'

  /* ── Mobile Header ── */
  if (isMobile) {
    const hh = String(time.getHours()).padStart(2, '0')
    const mm = String(time.getMinutes()).padStart(2, '0')

    return (
      <header className="flex-shrink-0" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between px-4" style={{ height: 48 }}>
          {/* Monogram — taps to go home */}
          <button
            className="font-cinzel tracking-widest"
            style={{ fontSize: '14px', color: 'var(--gold)', letterSpacing: '0.2em' }}
            onClick={() => setCurrentPage('dashboard')}
          >
            AÈ
          </button>

          {/* Section name */}
          <span
            className="font-cinzel uppercase absolute left-1/2"
            style={{ transform: 'translateX(-50%)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.22em' }}
          >
            {title}
          </span>

          {/* Time only */}
          <span className="font-mono tabular-nums" style={{ color: 'var(--bronze)', fontSize: '13px', letterSpacing: '0.06em' }}>
            {hh}:{mm}
          </span>
        </div>

        {/* Discipline progress bar — always visible on mobile */}
        <div style={{ height: 2, background: 'var(--divider)', position: 'relative' }}>
          <div
            style={{
              position:   'absolute',
              left:       0,
              top:        0,
              height:     '100%',
              width:      `${todayScore ?? 0}%`,
              background: 'var(--gold)',
              opacity:    0.8,
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        <OrnamentalDivider opacity={0.12} />
      </header>
    )
  }

  /* ── Desktop Header ── */
  return (
    <header className="flex-shrink-0" style={{ zIndex: 10 }}>
      <div className="flex items-center justify-between px-8 py-0" style={{ height: 56 }}>
        <div>
          <p className="font-cinzel uppercase tracking-widest" style={{ color: 'var(--muted)', fontSize: '10px', letterSpacing: '0.22em' }}>
            {title}
          </p>
        </div>

        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <span className="font-mono tabular-nums" style={{ color: 'var(--bronze)', fontSize: '15px', letterSpacing: '0.08em' }}>
            {formatTime(time)}
          </span>
        </div>

        <div className="text-right">
          <p className="font-cormorant italic" style={{ color: 'var(--text)', fontSize: '16px', lineHeight: 1.2 }}>
            {name}
          </p>
          <p className="font-garamond" style={{ color: 'var(--muted)', fontSize: '12px' }}>
            {formatDate(time)}
          </p>
        </div>
      </div>
      <OrnamentalDivider opacity={0.18} />
    </header>
  )
}
