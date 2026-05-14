import { useState }              from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp }                  from '../../context/AppContext'
import { formatRomanDate }         from '../../utils/dateHelpers'
import EntryModal                  from './EntryModal'

const INTENSITY_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

export default function PastEntries() {
  const { entries } = useApp()
  const [selected, setSelected] = useState(null)

  const today = new Date().toISOString().slice(0, 10)
  // Past entries = all except today, newest first
  const past  = [...entries]
    .filter((e) => e.date !== today)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  if (past.length === 0) {
    return (
      <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '15px' }}>
        No past entries yet. Your record begins today.
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-col" style={{ gap: 0 }}>
        <AnimatePresence>
          {past.map((entry) => (
            <motion.div
              key={entry.date}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 20, marginBottom: 4 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Date */}
                  <p
                    className="font-cinzel uppercase tracking-widest"
                    style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: 4 }}
                  >
                    {formatRomanDate(new Date(entry.date + 'T12:00:00'))}
                    {entry.intensity && (
                      <span style={{ color: 'var(--bronze)', marginLeft: 10 }}>
                        {INTENSITY_LABELS[entry.intensity]}
                      </span>
                    )}
                  </p>

                  {/* First 2 lines of victories */}
                  {entry.victories && (
                    <p
                      className="font-garamond line-clamp-2"
                      style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.65 }}
                    >
                      {entry.victories}
                    </p>
                  )}
                </div>

                <button
                  className="btn-ghost flex-shrink-0"
                  style={{ fontSize: '9px' }}
                  onClick={() => setSelected(entry)}
                >
                  Read
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selected && (
        <EntryModal entry={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
