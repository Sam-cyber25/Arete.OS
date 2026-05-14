import { useState }  from 'react'
import { motion }    from 'framer-motion'
import { useApp }    from '../../context/AppContext'

const NAV = [
  { id: 'dashboard',   numeral: 'I',    label: 'Overview'      },
  { id: 'goals',       numeral: 'II',   label: 'Goals'         },
  { id: 'memory',      numeral: 'III',  label: 'Memory'        },
  { id: 'planner',     numeral: 'IV',   label: 'Planner'       },
  { id: 'analytics',   numeral: 'V',    label: 'Analytics'     },
  { id: 'schedule',    numeral: 'VI',   label: 'Schedule'      },
  { id: 'journal',     numeral: 'VII',  label: 'Journal'       },
  { id: 'whiteboard',  numeral: 'VIII', label: 'Whiteboard'    },
  { id: 'stickynotes', numeral: 'IX',   label: 'Sticky Notes'  },
  { id: 'settings',    numeral: 'X',    label: 'Settings'      },
]

function SidebarDivider() {
  return (
    <svg width="100%" height="10" viewBox="0 0 160 10" fill="none" style={{ opacity: 0.25 }}>
      <line x1="0"  y1="5" x2="70"  y2="5" stroke="#C9A84C" strokeWidth="0.5" />
      <line x1="90" y1="5" x2="160" y2="5" stroke="#C9A84C" strokeWidth="0.5" />
      <polygon points="80,1 84,5 80,9 76,5" stroke="#C9A84C" strokeWidth="0.5" fill="none" />
    </svg>
  )
}

export default function Sidebar() {
  const { currentPage, setCurrentPage } = useApp()
  const [expanded, setExpanded]         = useState(false)

  const settingsIndex = NAV.findIndex((n) => n.id === 'settings')
  const mainNav       = NAV.slice(0, settingsIndex)
  const settingsItem  = NAV[settingsIndex]

  return (
    <motion.aside
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={()   => setExpanded(false)}
      animate={{ width: expanded ? 200 : 56 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 h-full flex flex-col py-8 overflow-hidden"
      style={{
        background:  'var(--bg)',
        borderRight: '1px solid var(--border)',
        zIndex: 20,
      }}
    >
      {/* Monogram */}
      <div className="flex items-center gap-3 px-4 mb-10 overflow-hidden" style={{ minHeight: 32 }}>
        <span
          className="flex-shrink-0 font-cinzel tracking-widest"
          style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.2em' }}
        >
          AO
        </span>
        <motion.span
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
          transition={{ duration: 0.15 }}
          className="whitespace-nowrap overflow-hidden font-cinzel tracking-widest"
          style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.28em' }}
        >
          ARÊTE OS
        </motion.span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {mainNav.map((item) => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="group relative flex items-center gap-4 py-2.5 text-left transition-colors duration-150"
              style={{
                paddingLeft:  10,
                borderLeft:   active ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              <span
                className="font-mono flex-shrink-0 text-right"
                style={{
                  width:    32,
                  fontSize: '11px',
                  color:    active ? 'var(--gold)' : 'var(--faint)',
                }}
              >
                {item.numeral}
              </span>
              <motion.span
                animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
                transition={{ duration: 0.14 }}
                className="font-cinzel whitespace-nowrap overflow-hidden uppercase"
                style={{
                  fontSize:      '10px',
                  letterSpacing: '0.18em',
                  color:         active ? 'var(--gold)' : 'var(--muted)',
                }}
              >
                {item.label}
              </motion.span>

              {/* Tooltip when collapsed */}
              {!expanded && (
                <div
                  className="absolute left-full ml-3 px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                  style={{
                    background:    'var(--surface)',
                    border:        '1px solid var(--border)',
                    fontFamily:    'Cinzel, serif',
                    fontSize:      '10px',
                    color:         'var(--text)',
                    letterSpacing: '0.12em',
                    zIndex:        50,
                  }}
                >
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Divider above settings */}
      <div className="px-3 mb-2">
        <SidebarDivider />
      </div>

      {/* Settings */}
      <div className="px-2">
        <button
          onClick={() => setCurrentPage(settingsItem.id)}
          className="group relative flex items-center gap-4 py-2.5 text-left w-full transition-colors duration-150"
          style={{
            paddingLeft: 10,
            borderLeft:  currentPage === 'settings' ? '2px solid var(--gold)' : '2px solid transparent',
          }}
        >
          <span
            className="font-mono flex-shrink-0 text-right"
            style={{
              width:    32,
              fontSize: '11px',
              color:    currentPage === 'settings' ? 'var(--gold)' : 'var(--faint)',
            }}
          >
            {settingsItem.numeral}
          </span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.14 }}
            className="font-cinzel whitespace-nowrap overflow-hidden uppercase"
            style={{
              fontSize:      '10px',
              letterSpacing: '0.18em',
              color:         currentPage === 'settings' ? 'var(--gold)' : 'var(--muted)',
            }}
          >
            {settingsItem.label}
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}
