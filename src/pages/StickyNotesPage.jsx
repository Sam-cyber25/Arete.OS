import { useState, useRef }         from 'react'
import { motion, AnimatePresence }   from 'framer-motion'
import { useStickyNotes }            from '../hooks/useStickyNotes'
import { useIsMobile }               from '../hooks/useIsMobile'
import OrnamentalDivider             from '../components/layout/OrnamentalDivider'

const PRIORITIES = ['HIGH', 'MID', 'LOW']

const PRIORITY_META = {
  HIGH: { label: 'High Priority', bg: '#1C1208', strip: '#8B5E1A', badge: '#E8A87C' },
  MID:  { label: 'Mid Priority',  bg: '#0E1208', strip: '#3A5C32', badge: '#A8C4A0' },
  LOW:  { label: 'Low Priority',  bg: '#0C0C12', strip: '#2A2A5C', badge: '#8AACCF' },
}

const SORT_OPTIONS = ['newest', 'oldest', 'pinned']

/* ── Debounced inline input ── */
function AutoInput({ value, onChange, placeholder, style, className }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)
  const handle = (e) => {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(e.target.value), 400)
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

/* ── Debounced inline textarea ── */
function AutoTextarea({ value, onChange, placeholder, style, className }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)
  const handle = (e) => {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(e.target.value), 400)
  }
  return (
    <textarea
      value={local}
      onChange={handle}
      placeholder={placeholder}
      className={className}
      style={{ ...style, outline: 'none', background: 'transparent', border: 'none', width: '100%', resize: 'none' }}
    />
  )
}

/* ── Individual note card ── */
function NoteCard({ note, onUpdate, onDelete, onTogglePin, onChangePriority, isMobile }) {
  const [hovered, setHovered] = useState(false)
  const meta = PRIORITY_META[note.priority] || PRIORITY_META.LOW

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        background:   meta.bg,
        border:       `1px solid ${hovered ? meta.strip + '66' : 'var(--border)'}`,
        borderRadius: 2,
        overflow:     'hidden',
        marginBottom: 12,
        transition:   'border-color 200ms ease',
        position:     'relative',
      }}
    >
      {/* Priority strip */}
      <div style={{ height: 3, background: meta.strip }} />

      <div style={{ padding: '12px 14px 14px' }}>
        {/* Badge row */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-cinzel" style={{ fontSize: '8px', letterSpacing: '0.15em', color: meta.badge }}>
            {note.pinned && <span style={{ marginRight: 4 }}>◆</span>}
            {meta.label.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <AutoInput
          value={note.title || ''}
          onChange={(v) => onUpdate(note.id, { title: v })}
          placeholder="Title..."
          className="font-cormorant"
          style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'block' }}
        />

        {/* Content — DB column name is `content` */}
        <AutoTextarea
          value={note.content || ''}
          onChange={(v) => onUpdate(note.id, { content: v })}
          placeholder="Write here..."
          className="font-garamond"
          style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, minHeight: 60 }}
          rows={3}
        />

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          <p className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)' }}>
            {new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>

          {/* Mobile controls */}
          {isMobile && (
            <div className="flex gap-3">
              <button
                className="font-cinzel"
                style={{ fontSize: '11px', color: note.pinned ? 'var(--gold)' : 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                onClick={() => onTogglePin(note.id)}
                title="Pin"
              >
                ◆
              </button>
              {note.priority !== 'HIGH' && (
                <button
                  className="font-cinzel"
                  style={{ fontSize: '11px', color: 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
                  onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) - 1])}
                  title="Increase priority"
                >
                  ↑
                </button>
              )}
              {note.priority !== 'LOW' && (
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
                style={{ fontSize: '14px', color: 'var(--muted)', padding: '4px 6px', minHeight: 'unset' }}
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
            {note.priority !== 'HIGH' && (
              <button
                className="font-cinzel"
                style={{ fontSize: '10px', color: 'var(--muted)', padding: '2px 5px', background: 'var(--surface)', border: '1px solid var(--border)', minHeight: 'unset' }}
                onClick={() => onChangePriority(note.id, PRIORITIES[PRIORITIES.indexOf(note.priority) - 1])}
                title="Increase priority"
              >
                ↑
              </button>
            )}
            {note.priority !== 'LOW' && (
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
}

/* ── Add note inline form ── */
function AddNoteForm({ priority, onAdd, onClose }) {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async () => {
    if (!content.trim() && !title.trim()) return
    await onAdd({ title, content, priority })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ background: '#13110E', border: '1px solid var(--gold)', borderRadius: 2, padding: 16, marginBottom: 12 }}
    >
      <input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-cormorant"
        style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid var(--divider)', width: '100%', marginBottom: 10, paddingBottom: 6 }}
      />
      <textarea
        placeholder="What's on your mind..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        className="font-garamond"
        style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, background: 'transparent', border: 'none', outline: 'none', width: '100%', resize: 'none' }}
        rows={3}
      />
      <div className="flex gap-3 justify-end mt-3">
        <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onClose}>Cancel</button>
        <button className="btn-primary" style={{ fontSize: '9px' }} onClick={handleSubmit}>Add Note</button>
      </div>
    </motion.div>
  )
}

/* ── Desktop column ── */
function Column({ priority, notes, sort, onAdd, onUpdate, onDelete, onTogglePin, onChangePriority, onDragStart, onDragOver, onDrop, onDropColumn }) {
  const meta = PRIORITY_META[priority]
  const [addingHere, setAddingHere] = useState(false)

  const sorted = [...notes].sort((a, b) => {
    if (sort === 'pinned' && a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
    return new Date(b.created_at) - new Date(a.created_at)
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
          <p className="font-cinzel uppercase" style={{ fontSize: '9px', color: meta.badge, letterSpacing: '0.22em' }}>
            {priority}
          </p>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)' }}>{notes.length}</span>
        </div>
        <button
          className="font-cinzel"
          style={{ fontSize: '16px', color: 'var(--muted)', minHeight: 'unset' }}
          onClick={() => setAddingHere((p) => !p)}
        >
          +
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <AnimatePresence>
          {addingHere && (
            <AddNoteForm
              priority={priority}
              onAdd={onAdd}
              onClose={() => setAddingHere(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {sorted.length === 0 && !addingHere && (
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
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onChangePriority={onChangePriority}
              isMobile={false}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function StickyNotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote, togglePin, byPriority } = useStickyNotes()
  const isMobile = useIsMobile()

  const [search,          setSearch]          = useState('')
  const [sorts,           setSorts]           = useState({ HIGH: 'newest', MID: 'newest', LOW: 'newest' })
  const [activeMobileTab, setActiveMobileTab] = useState('HIGH')
  const draggedId = useRef(null)

  const changePriority = (id, priority) => updateNote(id, { priority })

  const handleDragStart = (id) => { draggedId.current = id }

  const handleDrop = (targetId) => {
    if (!draggedId.current || draggedId.current === targetId) return
    const dragged = notes.find((n) => n.id === draggedId.current)
    const target  = notes.find((n) => n.id === targetId)
    if (!dragged || !target) return
    if (dragged.priority !== target.priority) changePriority(draggedId.current, target.priority)
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
        (n.title  || '').toLowerCase().includes(search.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(search.toLowerCase())
      )
    : notes

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--faint)' }}>
      — loading —
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
      style={{ height: '100%' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3 px-4 pt-4">
        <div>
          <p className="font-cinzel uppercase" style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}>
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

      {/* ── MOBILE: priority tabs ── */}
      {isMobile && (
        <div className="priority-tabs flex-shrink-0">
          {PRIORITIES.map((p) => {
            const meta  = PRIORITY_META[p]
            const count = filtered.filter((n) => n.priority === p).length
            return (
              <button
                key={p}
                onClick={() => setActiveMobileTab(p)}
                className={`priority-tab active-${p.toLowerCase()}`}
                style={{
                  color:             activeMobileTab === p ? meta.badge : 'var(--faint)',
                  borderBottomColor: activeMobileTab === p ? meta.strip : 'transparent',
                }}
              >
                {p}
                <span className="font-mono" style={{ marginLeft: 4, fontSize: '8px', color: 'var(--faint)' }}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ══ MOBILE VIEW ══ */}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          {/* Add button */}
          <button
            className="font-cinzel uppercase"
            style={{ fontSize: '9px', color: PRIORITY_META[activeMobileTab].badge, letterSpacing: '0.2em', marginBottom: 16, display: 'block' }}
            onClick={() => addNote({ title: '', content: '', priority: activeMobileTab })}
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
                No {activeMobileTab.toLowerCase()} priority notes
              </motion.p>
            )}
            {filtered
              .filter((n) => n.priority === activeMobileTab)
              .sort((a, b) => {
                const s = sorts[activeMobileTab]
                if (s === 'pinned' && a.pinned !== b.pinned) return a.pinned ? -1 : 1
                if (s === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
                return new Date(b.created_at) - new Date(a.created_at)
              })
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onChangePriority={changePriority}
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
                style={{ fontSize: '8px', letterSpacing: '0.12em', color: sorts[activeMobileTab] === s ? 'var(--gold)' : 'var(--faint)', minHeight: 44 }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ══ DESKTOP VIEW: three columns ══ */
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
                onTogglePin={togglePin}
                onChangePriority={changePriority}
                onDragStart={handleDragStart}
                onDragOver={() => {}}
                onDrop={handleDrop}
                onDropColumn={handleDropColumn}
              />
            ))}
          </div>

          {/* Sort row */}
          <div className="flex flex-shrink-0 mt-3" style={{ borderTop: '1px solid var(--divider)' }}>
            {PRIORITIES.map((priority) => (
              <div key={priority} className="flex-1 flex items-center gap-2 pt-3 px-1">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSorts((prev) => ({ ...prev, [priority]: s }))}
                    className="font-cinzel uppercase transition-colors"
                    style={{ fontSize: '8px', letterSpacing: '0.12em', color: sorts[priority] === s ? 'var(--gold)' : 'var(--faint)', minHeight: 'unset' }}
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
