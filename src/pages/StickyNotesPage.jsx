import { memo, useState, useRef, useEffect }       from 'react'
import { motion, AnimatePresence }                  from 'framer-motion'
import { useStickyNotes }                           from '../hooks/useStickyNotes'
import { useIsMobile }                              from '../hooks/useIsMobile'
import { format }                                   from 'date-fns'
import OrnamentalDivider                            from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const PRIORITY_META = {
  high: { label: 'High Priority', bg: '#1C1208', strip: '#8B5E1A', color: '#C9903A' },
  mid:  { label: 'Mid Priority',  bg: '#0E1208', strip: '#3A5C32', color: '#6A9E5A' },
  low:  { label: 'Low Priority',  bg: '#0C0C12', strip: '#2A2A5C', color: '#5A5A9E' },
}
const PRIORITIES = ['high', 'mid', 'low']
const SORT_OPTIONS = ['newest', 'oldest', 'pinned']

// ── Debounced textarea ───────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, style, className }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)
  useEffect(() => { setLocal(value) }, [value])
  const handle = (e) => {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(e.target.value), 300)
  }
  return (
    <textarea
      value={local}
      onChange={handle}
      placeholder={placeholder}
      className={className}
      style={{ ...style, resize: 'none', outline: 'none', background: 'transparent', border: 'none', width: '100%' }}
    />
  )
}

function AutoInput({ value, onChange, placeholder, style, className }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)
  useEffect(() => { setLocal(value) }, [value])
  const handle = (e) => {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(e.target.value), 300)
  }
  return (
    <input
      value={local}
      onChange={handle}
      placeholder={placeholder}
      className={className}
      style={{ ...style, outline: 'none', background: 'transparent', border: 'none', width: '100%' }}
    />
  )
}

// ── Individual sticky note ────────────────────────────────────
const StickyNote = memo(function StickyNote({
  note,
  onUpdate,
  onDelete,
  onChangePriority,
  onTogglePin,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  isMobile,
}) {
  const meta    = PRIORITY_META[note.priority] || PRIORITY_META.low
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable={!isMobile}
      onDragStart={!isMobile ? (e) => { e.dataTransfer.setData('noteId', note.id); onDragStart(note.id) } : undefined}
      onDragOver={!isMobile  ? (e)  => { e.preventDefault(); onDragOver(note.id) } : undefined}
      onDrop={!isMobile      ? (e)  => { e.preventDefault(); onDrop(note.id) } : undefined}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        background:  meta.bg,
        border:      `1px solid ${hovered ? meta.strip + '66' : 'var(--border)'}`,
        minHeight:   160,
        transition:  'border-color 200ms ease',
        cursor:      isMobile ? 'default' : 'grab',
        position:    'relative',
        marginBottom: 12,
      }}
    >
      {/* Priority color strip */}
      <div style={{ height: 4, background: meta.strip, width: '100%' }} />

      <div style={{ padding: '12px 14px 14px' }}>
        {/* Priority badge */}
        <p
          className="font-cinzel uppercase"
          style={{ fontSize: '8px', letterSpacing: '0.16em', color: meta.color, marginBottom: 8 }}
        >
          {note.pinned && <span style={{ marginRight: 4 }}>◆</span>}
          {meta.label}
        </p>

        {/* Title */}
        <AutoInput
          value={note.title}
          onChange={(v) => onUpdate(note.id, { title: v })}
          placeholder="Title..."
          className="font-cormorant"
          style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'block' }}
        />

        {/* Body */}
        <AutoTextarea
          value={note.body}
          onChange={(v) => onUpdate(note.id, { body: v })}
          placeholder="Write here..."
          className="font-garamond"
          style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, minHeight: 60 }}
        />

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          <p className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)' }}>
            {format(note.createdAt, 'MMM d')}
          </p>

          {/* Mobile action row */}
          {isMobile && (
            <div className="flex gap-3">
              <button
                className="font-cinzel"
                style={{ fontSize: '11px', color: note.pinned ? 'var(--gold)' : 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                onClick={() => onTogglePin(note.id)}
              >
                ◆
              </button>
              {note.priority !== 'high' && (
                <button
                  className="font-cinzel"
                  style={{ fontSize: '11px', color: 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                  onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) - 1])}
                  title="Increase priority"
                >
                  ↑
                </button>
              )}
              {note.priority !== 'low' && (
                <button
                  className="font-cinzel"
                  style={{ fontSize: '11px', color: 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                  onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) + 1])}
                  title="Decrease priority"
                >
                  ↓
                </button>
              )}
              <button
                className="font-cinzel"
                style={{ fontSize: '12px', color: 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                onClick={() => onDelete(note.id)}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop hover controls */}
      <AnimatePresence>
        {!isMobile && hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex gap-1"
          >
            {note.priority !== 'high' && (
              <button
                className="font-cinzel"
                style={{ fontSize: '10px', color: 'var(--muted)', padding: '2px 5px', background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 'unset' }}
                onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) - 1])}
                title="Increase priority"
              >
                ↑
              </button>
            )}
            {note.priority !== 'low' && (
              <button
                className="font-cinzel"
                style={{ fontSize: '10px', color: 'var(--muted)', padding: '2px 5px', background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 'unset' }}
                onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) + 1])}
                title="Decrease priority"
              >
                ↓
              </button>
            )}
            <button
              className="font-cinzel"
              style={{ fontSize: '10px', color: note.pinned ? 'var(--gold)' : 'var(--muted)', padding: '2px 5px', background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 'unset' }}
              onClick={() => onTogglePin(note.id)}
              title="Pin"
            >
              ◆
            </button>
            <button
              className="font-cinzel"
              style={{ fontSize: '10px', color: 'var(--muted)', padding: '2px 5px', background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 'unset' }}
              onClick={() => onDelete(note.id)}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ── Desktop Column ────────────────────────────────────────────
function Column({ priority, notes, sort, onAdd, onUpdate, onDelete, onChangePriority, onTogglePin, onDragStart, onDragOver, onDrop, onDropColumn, isMobile }) {
  const meta = PRIORITY_META[priority]

  const sorted = [...notes].sort((a, b) => {
    if (sort === 'pinned') {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    }
    if (sort === 'oldest') return a.createdAt - b.createdAt
    return b.createdAt - a.createdAt
  })

  return (
    <div
      className="flex flex-col flex-1 min-w-0"
      style={{ borderRight: '1px solid var(--border)' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropColumn(priority, e.dataTransfer.getData('noteId')) }}
    >
      {/* Column header */}
      <div
        className="flex-shrink-0 px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 6, height: 6, background: meta.strip, flexShrink: 0 }} />
          <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '9px', color: meta.color, letterSpacing: '0.22em' }}>
            {priority}
          </p>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)' }}>
            {notes.length}
          </span>
        </div>
        <button
          className="font-cinzel"
          style={{ fontSize: '14px', color: 'var(--muted)', minHeight: 'unset' }}
          onClick={() => onAdd(priority)}
        >
          +
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-garamond italic"
              style={{ fontSize: '14px', color: 'var(--faint)', textAlign: 'center', marginTop: 24 }}
            >
              Empty column
            </motion.p>
          )}
          {sorted.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onChangePriority={onChangePriority}
              onTogglePin={onTogglePin}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              isMobile={isMobile}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function StickyNotesPage() {
  const { notes, addNote, updateNote, deleteNote, changePriority, togglePin, reorder } = useStickyNotes()
  const isMobile = useIsMobile()

  const [search,        setSearch]        = useState('')
  const [sorts,         setSorts]         = useState({ high: 'newest', mid: 'newest', low: 'newest' })
  const [activeMobileTab, setActiveMobileTab] = useState('high')   // mobile only
  const draggedId = useRef(null)

  const handleDragStart = (id) => { draggedId.current = id }
  const handleDragOver  = () => {}

  const handleDrop = (targetId) => {
    if (!draggedId.current || draggedId.current === targetId) return
    const dragged = notes.find((n) => n.id === draggedId.current)
    const target  = notes.find((n) => n.id === targetId)
    if (!dragged || !target) return
    if (dragged.priority !== target.priority) {
      changePriority(draggedId.current, target.priority)
    } else {
      reorder(draggedId.current, targetId)
    }
    draggedId.current = null
  }

  const handleDropColumn = (priority, noteId) => {
    if (!noteId) return
    const note = notes.find((n) => n.id === noteId)
    if (note && note.priority !== priority) changePriority(noteId, priority)
    draggedId.current = null
  }

  const filtered = search.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.body.toLowerCase().includes(search.toLowerCase())
      )
    : notes

  return (
    <motion.div {...PAGE} className="flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3 px-4 pt-4">
        <div>
          <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '13px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}>
            Epistulae
          </p>
          <p className="font-cormorant" style={{ fontSize: '24px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
            Sticky Notes
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: isMobile ? 140 : 240 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input-underline font-garamond"
            style={{ fontSize: '14px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-0 bottom-2 btn-ghost"
              style={{ fontSize: '9px', minHeight: 'unset' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── MOBILE: Priority tabs ── */}
      {isMobile && (
        <div className="priority-tabs flex-shrink-0">
          {PRIORITIES.map((p) => {
            const meta = PRIORITY_META[p]
            const count = filtered.filter((n) => n.priority === p).length
            return (
              <button
                key={p}
                onClick={() => setActiveMobileTab(p)}
                className={`priority-tab active-${p}`}
                style={{
                  color:             activeMobileTab === p ? meta.color : 'var(--faint)',
                  borderBottomColor: activeMobileTab === p ? meta.strip : 'transparent',
                }}
              >
                {p.toUpperCase()}
                <span className="font-mono" style={{ marginLeft: 4, fontSize: '8px', color: 'var(--faint)' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {isMobile ? (
        /* ── MOBILE: single column ── */
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          {/* Add button */}
          <button
            className="font-cinzel uppercase"
            style={{ fontSize: '9px', color: PRIORITY_META[activeMobileTab].color, letterSpacing: '0.2em', marginBottom: 16, display: 'block' }}
            onClick={() => addNote(activeMobileTab)}
          >
            + New Note
          </button>

          <AnimatePresence mode="popLayout">
            {filtered.filter((n) => n.priority === activeMobileTab).length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-garamond italic"
                style={{ fontSize: '14px', color: 'var(--faint)', textAlign: 'center', marginTop: 24 }}
              >
                No {activeMobileTab} priority notes
              </motion.p>
            )}
            {filtered
              .filter((n) => n.priority === activeMobileTab)
              .sort((a, b) => {
                const s = sorts[activeMobileTab]
                if (s === 'pinned' && a.pinned !== b.pinned) return a.pinned ? -1 : 1
                if (s === 'oldest') return a.createdAt - b.createdAt
                return b.createdAt - a.createdAt
              })
              .map((note) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onChangePriority={changePriority}
                  onTogglePin={togglePin}
                  onDragStart={() => {}}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                  isMobile={true}
                />
              ))
            }
          </AnimatePresence>

          {/* Mobile sort */}
          <div className="flex gap-4 pt-3 pb-4" style={{ borderTop: '1px solid var(--divider)', marginTop: 8 }}>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSorts((prev) => ({ ...prev, [activeMobileTab]: s }))}
                className="font-cinzel uppercase"
                style={{
                  fontSize:      '8px',
                  letterSpacing: '0.12em',
                  color:         sorts[activeMobileTab] === s ? 'var(--gold)' : 'var(--faint)',
                  minHeight:     44,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── DESKTOP: three columns ── */
        <>
          <div
            className="flex flex-1 min-h-0"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            {PRIORITIES.map((priority) => (
              <Column
                key={priority}
                priority={priority}
                notes={filtered.filter((n) => n.priority === priority)}
                sort={sorts[priority]}
                onAdd={addNote}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onChangePriority={changePriority}
                onTogglePin={togglePin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDropColumn={handleDropColumn}
                isMobile={false}
              />
            ))}
          </div>

          {/* Sort row */}
          <div className="flex flex-shrink-0 mt-3 gap-0" style={{ borderTop: '1px solid var(--divider)' }}>
            {PRIORITIES.map((priority) => (
              <div key={priority} className="flex-1 flex items-center gap-2 pt-3 px-1">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSorts((prev) => ({ ...prev, [priority]: s }))}
                    className="font-cinzel uppercase transition-colors"
                    style={{
                      fontSize:      '8px',
                      letterSpacing: '0.12em',
                      color:         sorts[priority] === s ? 'var(--gold)' : 'var(--faint)',
                      minHeight:     'unset',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
