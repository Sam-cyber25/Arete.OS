import { useState, useEffect }     from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../context/AppContext'
import NoteCard                     from '../components/memory/NoteCard'
import AddNotePanel                 from '../components/memory/AddNotePanel'
import MemorySearch                 from '../components/memory/MemorySearch'
import OrnamentalDivider            from '../components/layout/OrnamentalDivider'
import Modal                        from '../components/ui/Modal'
import { useIsMobile }              from '../hooks/useIsMobile'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

export default function MemoryPage() {
  const { notes, notesThisWeek, mostUsedTag } = useApp()
  const isMobile                               = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)
  const [search,    setSearch]    = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [reading,   setReading]   = useState(null)   // note being read in full

  /* Keep a stable snapshot so Modal exit-animation still has content to show */
  const [snap, setSnap] = useState(null)
  useEffect(() => { if (reading) setSnap(reading) }, [reading])

  const filtered = notes.filter((n) => {
    if (activeTag && !n.tags.includes(activeTag)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      n.title.toLowerCase().includes(q)   ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    )
  })

  const allTags = [...new Set(notes.flatMap((n) => n.tags))].slice(0, 20)

  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 740, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="font-cinzel uppercase tracking-widest"
            style={{ fontSize: '13px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}
          >
            Memoria
          </p>
          <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
            Memory
          </p>
        </div>
        <button
          className="btn-primary"
          style={isMobile ? { marginRight: 0, flexShrink: 0 } : undefined}
          onClick={() => setPanelOpen(true)}
        >
          New Memory
        </button>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Stats row */}
      <div
        className="flex gap-10 mb-8"
        style={{ paddingBottom: 20, borderBottom: '1px solid var(--divider)' }}
      >
        {[
          { label: 'Total',     value: notes.length },
          { label: 'This Week', value: notesThisWeek },
          { label: 'Top Tag',   value: mostUsedTag ? `#${mostUsedTag}` : '—' },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-mono" style={{ fontSize: '24px', color: 'var(--gold)' }}>{s.value}</p>
            <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginTop: 2 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <MemorySearch value={search} onChange={setSearch} />
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTag(null)}
            className="font-mono transition-colors"
            style={{ fontSize: '10px', color: !activeTag ? 'var(--gold)' : 'var(--faint)', letterSpacing: '0.05em' }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className="font-mono transition-colors"
              style={{ fontSize: '10px', color: activeTag === tag ? 'var(--gold)' : 'var(--faint)', letterSpacing: '0.05em' }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes feed */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-garamond italic"
            style={{ color: 'var(--faint)', fontSize: '15px' }}
          >
            {search || activeTag
              ? 'No notes match your search.'
              : 'No memories recorded yet. Begin with a thought.'}
          </motion.p>
        ) : (
          filtered.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx, 8) * 0.05 }}
            >
              <NoteCard
                note={note}
                onTagClick={(tag) => setActiveTag(tag === activeTag ? null : tag)}
                onReadClick={(n) => setReading(n)}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Slide-up add panel */}
      <AddNotePanel open={panelOpen} onClose={() => setPanelOpen(false)} />

      {/* Full-read modal */}
      <Modal isOpen={!!reading} onClose={() => setReading(null)}>
        {snap && (
          <>
            {/* Title */}
            {snap.title && (
              <p
                className="font-cormorant"
                style={{ fontSize: '26px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}
              >
                {snap.title}
              </p>
            )}

            {/* Meta */}
            <p className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', marginBottom: 24 }}>
              {new Date(snap.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {snap.source !== 'manual' && (
                <span style={{ marginLeft: 8 }}>[{snap.source}]</span>
              )}
            </p>

            {/* Content */}
            <p
              className="font-garamond"
              style={{ fontSize: '17px', color: 'var(--text)', lineHeight: 1.85, whiteSpace: 'pre-wrap', marginBottom: 24 }}
            >
              {snap.content}
            </p>

            {/* Tags */}
            {snap.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {snap.tags.map((tag) => (
                  <span key={tag} className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', letterSpacing: '0.05em' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setReading(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  )
}
