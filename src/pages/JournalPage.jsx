import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import JournalEditor                from '../components/journal/JournalEditor'
import PastEntries                  from '../components/journal/PastEntries'
import OrnamentalDivider            from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const TABS = [
  { id: 'today', label: "Today's Entry" },
  { id: 'past',  label: 'Past Entries'  },
]

export default function JournalPage() {
  const [tab, setTab] = useState('today')

  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="font-cinzel uppercase tracking-widest"
          style={{ fontSize: '13px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}
        >
          Acta Diurna
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Daily Journal
        </p>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Tabs */}
      <div
        className="flex gap-6 mb-8"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="font-cinzel uppercase transition-colors"
            style={{
              fontSize:      '10px',
              letterSpacing: '0.2em',
              color:         tab === t.id ? 'var(--gold)' : 'var(--faint)',
              paddingBottom: 12,
              borderBottom:  tab === t.id ? '1px solid var(--gold)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'today' ? (
          <motion.div
            key="today"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <JournalEditor />
          </motion.div>
        ) : (
          <motion.div
            key="past"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PastEntries />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
