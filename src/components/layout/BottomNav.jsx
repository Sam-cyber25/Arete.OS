import { useState }              from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp }                  from '../../context/AppContext'

/* The 5 primary bottom nav items */
const PRIMARY_NAV = [
  { id: 'dashboard',   numeral: 'I',   label: 'HOME'  },
  { id: 'goals',       numeral: 'II',  label: 'GOALS' },
  { id: 'planner',     numeral: 'III', label: 'PLAN'  },
  { id: 'memory',      numeral: 'IV',  label: 'MEMO'  },
  { id: '__more__',    numeral: 'V',   label: 'MORE'  },
]

/* Sections accessible via the "MORE" drawer */
const MORE_ITEMS = [
  { id: 'analytics',   numeral: 'V',    label: 'Analytics'    },
  { id: 'schedule',    numeral: 'VI',   label: 'Schedule'     },
  { id: 'journal',     numeral: 'VII',  label: 'Journal'      },
  { id: 'whiteboard',  numeral: 'VIII', label: 'Whiteboard'   },
  { id: 'stickynotes', numeral: 'IX',   label: 'Sticky Notes' },
  { id: 'settings',    numeral: 'X',    label: 'Settings'     },
]

export default function BottomNav() {
  const { currentPage, setCurrentPage } = useApp()
  const [drawerOpen, setDrawerOpen]     = useState(false)

  const isMoreActive = MORE_ITEMS.some((i) => i.id === currentPage)

  const handlePrimary = (id) => {
    if (id === '__more__') {
      setDrawerOpen((p) => !p)
    } else {
      setCurrentPage(id)
      setDrawerOpen(false)
    }
  }

  const handleMore = (id) => {
    setCurrentPage(id)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* ── Slide-up MORE drawer ─────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(12,10,8,0.72)' }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 z-50"
              style={{
                bottom:     56,
                background: '#0C0A08',
                borderTop:  '1px solid rgba(201,168,76,0.3)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div style={{ width: 36, height: 2, background: '#4A3F32', borderRadius: 2 }} />
              </div>

              <p className="font-cinzel uppercase text-center" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.28em', paddingBottom: 12 }}>
                More Sections
              </p>

              {MORE_ITEMS.map((item, idx) => {
                const active = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMore(item.id)}
                    className="flex items-center gap-4 w-full text-left transition-colors"
                    style={{
                      padding:      '15px 28px',
                      borderTop:    idx === 0 ? '1px solid var(--divider)' : 'none',
                      borderBottom: '1px solid var(--divider)',
                      background:   active ? '#1A1610' : 'transparent',
                      minHeight:    52,
                    }}
                  >
                    <span
                      className="font-mono flex-shrink-0"
                      style={{ fontSize: '11px', color: active ? 'var(--gold)' : 'var(--faint)', width: 28 }}
                    >
                      {item.numeral}
                    </span>
                    <span
                      className="font-cinzel uppercase"
                      style={{ fontSize: '11px', letterSpacing: '0.2em', color: active ? 'var(--gold)' : 'var(--muted)' }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div style={{ marginLeft: 'auto', width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%' }} />
                    )}
                  </button>
                )
              })}
              {/* bottom safe area spacer */}
              <div style={{ height: 8 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Fixed Bottom Nav Bar ─────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 bottom-0 z-40 flex items-center"
        style={{
          height:      56,
          background:  '#0C0A08',
          borderTop:   '1px solid #2A2520',
        }}
      >
        {PRIMARY_NAV.map((item) => {
          const isMore    = item.id === '__more__'
          const active    = isMore ? (drawerOpen || isMoreActive) : currentPage === item.id

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
