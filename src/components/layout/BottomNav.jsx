import { useState, useRef }         from 'react'
import { motion, AnimatePresence }   from 'framer-motion'
import { useApp }                    from '../../context/AppContext'

/* 5-tab bottom nav: HOME · GOALS · ◆TODAY · PLAN · MORE */
const PRIMARY_NAV = [
  { id: 'dashboard',   numeral: 'I',  label: 'HOME'  },
  { id: 'goals',       numeral: 'II', label: 'GOALS' },
  { id: '__today__',   numeral: '◆',  label: 'TODAY', isCenter: true },
  { id: 'planner',     numeral: 'IV', label: 'PLAN'  },
  { id: '__more__',    numeral: 'V',  label: 'MORE'  },
]

/* Slide-up MORE sheet items */
const MORE_ITEMS = [
  { id: 'memory',      numeral: 'IV',   label: 'Memory'      },
  { id: 'analytics',   numeral: 'VI',   label: 'Analytics'   },
  { id: 'schedule',    numeral: 'VII',  label: 'Schedule'    },
  { id: 'journal',     numeral: 'VIII', label: 'Journal'     },
  { id: 'codex',       numeral: 'IX',   label: 'Codex'       },
  { id: 'corpus',      numeral: 'X',    label: 'Corpus'      },
  { id: 'whiteboard',  numeral: 'XI',   label: 'Whiteboard'  },
  { id: 'stickynotes', numeral: 'XII',  label: 'Sticky Notes'},
  { id: 'settings',    numeral: 'XIII', label: 'Settings'    },
]

const MORE_IDS  = new Set(MORE_ITEMS.map((i) => i.id))
const NAV_H     = 64   // px — taller for better thumb reach

export default function BottomNav() {
  const { currentPage, setCurrentPage, todayScore } = useApp()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const startY = useRef(null)

  const isMoreActive   = MORE_IDS.has(currentPage)
  const isDisciplines  = currentPage === 'disciplines'

  const handlePrimary = (id) => {
    if (id === '__more__') {
      setDrawerOpen((p) => !p)
    } else if (id === '__today__') {
      setCurrentPage('disciplines')
      setDrawerOpen(false)
    } else {
      setCurrentPage(id)
      setDrawerOpen(false)
    }
  }

  /* Drag-down to close MORE sheet */
  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY }
  const handleTouchEnd   = (e) => {
    if (startY.current !== null && e.changedTouches[0].clientY - startY.current > 60) {
      setDrawerOpen(false)
    }
    startY.current = null
  }

  return (
    <>
      {/* ── MORE slide-up sheet ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(12,10,8,0.75)' }}
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 z-50"
              style={{ bottom: NAV_H, background: '#0C0A08', borderTop: '1px solid rgba(201,168,76,0.3)' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div style={{ width: 40, height: 3, background: '#4A3F32', borderRadius: 99 }} />
              </div>
              <p className="font-cinzel uppercase text-center" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.28em', paddingBottom: 10 }}>
                More Sections
              </p>

              {MORE_ITEMS.map((item, idx) => {
                const active = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id); setDrawerOpen(false) }}
                    className="flex items-center gap-4 w-full text-left transition-colors"
                    style={{
                      padding:      '0 28px',
                      height:       56,
                      borderTop:    idx === 0 ? '1px solid var(--divider)' : 'none',
                      borderBottom: '1px solid var(--divider)',
                      background:   active ? '#1A1610' : 'transparent',
                    }}
                  >
                    <span className="font-mono flex-shrink-0" style={{ fontSize: '11px', color: active ? 'var(--gold)' : 'var(--faint)', width: 30 }}>
                      {item.numeral}
                    </span>
                    <span className="font-cinzel uppercase" style={{ fontSize: '11px', letterSpacing: '0.2em', color: active ? 'var(--gold)' : 'var(--muted)' }}>
                      {item.label}
                    </span>
                    {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%' }} />}
                  </button>
                )
              })}
              <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom bar ── */}
      <nav
        className="fixed left-0 right-0 bottom-0 z-40 flex items-center"
        style={{
          height:     NAV_H,
          background: '#0C0A08',
          borderTop:  '1px solid #2A2520',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRIMARY_NAV.map((item) => {
          const isMore   = item.id === '__more__'
          const isToday  = item.id === '__today__'
          const active   = isMore   ? (drawerOpen || isMoreActive)
                         : isToday  ? (isDisciplines)
                         : currentPage === item.id

          if (isToday) {
            /* ── Center gold circle tab ── */
            return (
              <div key="today" className="flex flex-col items-center justify-center flex-1" style={{ minWidth: 0 }}>
                <motion.button
                  onClick={() => handlePrimary(item.id)}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width:           56,
                    height:          56,
                    borderRadius:    '50%',
                    background:      isDisciplines ? '#C9A84C' : 'rgba(201,168,76,0.15)',
                    border:          `1px solid ${isDisciplines ? '#C9A84C' : 'rgba(201,168,76,0.5)'}`,
                    display:         'flex',
                    flexDirection:   'column',
                    alignItems:      'center',
                    justifyContent:  'center',
                    transform:       'translateY(-8px)',
                    boxShadow:       isDisciplines ? '0 0 20px rgba(201,168,76,0.3)' : 'none',
                    transition:      'background 0.2s, box-shadow 0.2s',
                    cursor:          'pointer',
                  }}
                >
                  <span style={{ fontSize: '20px', color: isDisciplines ? '#0C0A08' : 'var(--gold)', lineHeight: 1 }}>
                    ◆
                  </span>
                  <span
                    className="font-cinzel"
                    style={{ fontSize: '6px', letterSpacing: '0.14em', color: isDisciplines ? '#0C0A08' : 'var(--gold)', marginTop: 1 }}
                  >
                    TODAY
                  </span>
                </motion.button>
              </div>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handlePrimary(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              style={{ minWidth: 0 }}
            >
              <span
                className="font-mono"
                style={{ fontSize: '13px', color: active ? 'var(--gold)' : 'var(--faint)', lineHeight: 1, marginBottom: 3 }}
              >
                {item.numeral}
              </span>
              <span
                className="font-cinzel"
                style={{ fontSize: '7px', letterSpacing: '0.16em', color: active ? 'var(--gold)' : 'var(--faint)' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
