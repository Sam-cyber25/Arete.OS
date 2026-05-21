import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal }                                      from 'react-dom'
import { motion, AnimatePresence }                           from 'framer-motion'
import { useApp }                                            from '../context/AppContext'

const SECTIONS = [
  { id: 'dashboard',   numeral: 'I',    label: 'Overview'     },
  { id: 'goals',       numeral: 'II',   label: 'Goals'        },
  { id: 'disciplines', numeral: 'III',  label: 'Disciplines'  },
  { id: 'memory',      numeral: 'IV',   label: 'Memory'       },
  { id: 'planner',     numeral: 'V',    label: 'Planner'      },
  { id: 'analytics',   numeral: 'VI',   label: 'Analytics'    },
  { id: 'schedule',    numeral: 'VII',  label: 'Schedule'     },
  { id: 'journal',     numeral: 'VIII', label: 'Journal'      },
  { id: 'whiteboard',  numeral: 'IX',   label: 'Whiteboard'   },
  { id: 'stickynotes', numeral: 'X',    label: 'Sticky Notes' },
  { id: 'settings',    numeral: 'XI',   label: 'Settings'     },
]

export default function CommandPalette({ open, onClose }) {
  const { setCurrentPage, goals, notes, habits } = useApp()
  const [query,   setQuery]   = useState('')
  const [cursor,  setCursor]  = useState(0)
  const inputRef  = useRef(null)
  const listRef   = useRef(null)

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  /* Build result list */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS.map((s) => ({ type: 'section', ...s }))

    const out = []

    SECTIONS.forEach((s) => {
      if (s.label.toLowerCase().includes(q) || s.numeral.toLowerCase().includes(q)) {
        out.push({ type: 'section', ...s })
      }
    })
    ;(goals || []).forEach((g) => {
      if (g.title.toLowerCase().includes(q)) {
        out.push({ type: 'goal', id: g.id, label: g.title, dest: 'goals' })
      }
    })
    ;(notes || []).forEach((n) => {
      const t = (n.title || n.content || '').toLowerCase()
      if (t.includes(q)) {
        out.push({ type: 'note', id: n.id, label: n.title || n.content.slice(0, 40), dest: 'memory' })
      }
    })
    ;(habits || []).forEach((h) => {
      if (h.name.toLowerCase().includes(q)) {
        out.push({ type: 'habit', id: h.id, label: h.name, dest: 'disciplines' })
      }
    })

    return out.slice(0, 12)
  }, [query, goals, notes, habits])

  /* Keep cursor in bounds */
  useEffect(() => { setCursor((c) => Math.min(c, Math.max(0, results.length - 1))) }, [results])

  /* Scroll active item into view */
  useEffect(() => {
    const el = listRef.current?.children[cursor]
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const navigate = useCallback((item) => {
    setCurrentPage(item.dest || item.id)
    onClose()
  }, [setCurrentPage, onClose])

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && results[cursor]) navigate(results[cursor])
    if (e.key === 'Escape')    onClose()
  }

  const typeLabel = (type) => {
    if (type === 'section') return null
    if (type === 'goal')    return 'Goal'
    if (type === 'note')    return 'Note'
    if (type === 'habit')   return 'Habit'
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(12,10,8,0.82)', backdropFilter: 'blur(2px)',
            }}
            onClick={onClose}
          />

          {/* Panel — x:'-50%' keeps centering while Framer animates y/scale/opacity */}
          <motion.div
            key="cp-panel"
            initial={{ x: '-50%', opacity: 0, y: -16, scale: 0.98 }}
            animate={{ x: '-50%', opacity: 1, y: 0,   scale: 1    }}
            exit   ={{ x: '-50%', opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position  : 'fixed',
              top       : '18%',
              left      : '50%',
              zIndex    : 9999,
              width     : 'min(600px, 92vw)',
              background: '#0C0A08',
              border    : '1px solid rgba(201,168,76,0.35)',
              boxShadow : '0 24px 64px rgba(0,0,0,0.7)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <span className="font-mono" style={{ fontSize: '14px', color: 'var(--gold)', flexShrink: 0 }}>⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0) }}
                onKeyDown={handleKey}
                placeholder="Search sections, goals, notes, habits…"
                className="font-garamond flex-1"
                style={{
                  background:  'transparent',
                  border:      'none',
                  outline:     'none',
                  fontSize:    '17px',
                  color:       'var(--text)',
                  letterSpacing: '0.01em',
                }}
              />
              <span
                className="font-mono flex-shrink-0"
                style={{ fontSize: '10px', color: 'var(--faint)', background: 'var(--divider)', padding: '3px 7px' }}
              >
                ESC
              </span>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              style={{ maxHeight: 380, overflowY: 'auto' }}
            >
              {results.length === 0 ? (
                <p className="font-garamond italic text-center" style={{ padding: '24px', color: 'var(--muted)', fontSize: '15px' }}>
                  No results
                </p>
              ) : (
                results.map((item, i) => {
                  const tag = typeLabel(item.type)
                  const active = i === cursor
                  return (
                    <button
                      key={`${item.type}-${item.id || item.label}-${i}`}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setCursor(i)}
                      className="flex items-center gap-4 w-full text-left"
                      style={{
                        padding:    '12px 20px',
                        background: active ? '#1A1610' : 'transparent',
                        borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                        transition: 'background 80ms ease',
                      }}
                    >
                      {item.type === 'section' && (
                        <span className="font-mono flex-shrink-0" style={{ fontSize: '11px', color: 'var(--gold)', width: 28 }}>
                          {item.numeral}
                        </span>
                      )}
                      {tag && (
                        <span
                          className="font-cinzel uppercase flex-shrink-0"
                          style={{ fontSize: '8px', color: 'var(--bronze)', letterSpacing: '0.15em', width: 40 }}
                        >
                          {tag}
                        </span>
                      )}
                      <span
                        className={item.type === 'section' ? 'font-cinzel uppercase' : 'font-garamond'}
                        style={{
                          fontSize:      item.type === 'section' ? '10px' : '15px',
                          letterSpacing: item.type === 'section' ? '0.18em' : '0',
                          color:         active ? 'var(--text)' : 'var(--muted)',
                          flex:          1,
                        }}
                      >
                        {item.label}
                      </span>
                      {active && (
                        <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', color: 'var(--faint)' }}>↵</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center gap-4 px-5 py-2"
              style={{ borderTop: '1px solid var(--divider)' }}
            >
              {[['↑↓','Navigate'], ['↵','Open'], ['Esc','Close']].map(([key, desc]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)', background: 'var(--divider)', padding: '2px 5px' }}>{key}</span>
                  <span className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.12em' }}>{desc}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
