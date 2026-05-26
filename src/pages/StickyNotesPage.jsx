import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import { useStickyNotes }               from '../hooks/useStickyNotes'
import { useIsMobile }                  from '../hooks/useIsMobile'
import OrnamentalDivider                from '../components/layout/OrnamentalDivider'

const PRIORITIES = ['HIGH', 'MID', 'LOW']

const META = {
  HIGH: { bg: '#1A1008', strip: '#8B5E1A', badge: '#E8A87C' },
  MID:  { bg: '#0E1208', strip: '#3A5C32', badge: '#A8C4A0' },
  LOW:  { bg: '#0C0C14', strip: '#2A2A5C', badge: '#8AACCF' },
}

/* ─────────────────────────────────────────────
   Inline editable field — shows text, click → input/textarea
   Auto-saves 500 ms after last keystroke; saves immediately on blur.
───────────────────────────────────────────── */
function EditableField({ value, onChange, placeholder, multiline, className, style }) {
  const [editing, setEditing] = useState(false)
  const [local,   setLocal]   = useState(value || '')
  const timerRef = useRef(null)

  /* Sync display value when note updates from server */
  useEffect(() => {
    if (!editing) setLocal(value || '')
  }, [value, editing])

  const debounceSync = (val) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (val !== value) onChange(val)
    }, 500)
  }

  const handleChange = (e) => {
    setLocal(e.target.value)
    debounceSync(e.target.value)
  }

  const handleBlur = (e) => {
    clearTimeout(timerRef.current)
    setEditing(false)
    if (e.target.value !== value) onChange(e.target.value)
  }

  const sharedInputStyle = {
    background: 'transparent',
    border:     'none',
    outline:    'none',
    width:      '100%',
    ...style,
  }

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        rows={4}
        style={{ ...sharedInputStyle, resize: 'none' }}
      />
    ) : (
      <input
        autoFocus
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        style={sharedInputStyle}
      />
    )
  }

  if (multiline) {
    return (
      <p
        onClick={() => setEditing(true)}
        className={className}
        style={{
          ...style,
          cursor:          'text',
          whiteSpace:      'pre-wrap',
          overflow:        'hidden',
          display:         '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          minHeight:       '1.2em',
        }}
      >
        {local || <span style={{ color: 'var(--faint)', fontStyle: 'italic', fontWeight: 400 }}>{placeholder}</span>}
      </p>
    )
  }

  return (
    <p
      onClick={() => setEditing(true)}
      className={className}
      style={{
        ...style,
        cursor:       'text',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        whiteSpace:   'nowrap',
        minHeight:    '1.2em',
      }}
    >
      {local || <span style={{ color: 'var(--faint)', fontStyle: 'italic', fontWeight: 400 }}>{placeholder}</span>}
    </p>
  )
}

/* ─────────────────────────────────────────────
   Note card
───────────────────────────────────────────── */
function NoteCard({ note, onUpdate, onDelete, onTogglePin, onTagClick, onMovePriority }) {
  const [hovered, setHovered] = useState(false)
  const meta = META[note.priority] || META.LOW
  const tags = Array.isArray(note.tags) ? note.tags : []

  const borderColor = note.pinned
    ? 'var(--gold)'
    : hovered
      ? `${meta.strip}66`
      : 'var(--border)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  meta.bg,
        border:      `1px solid ${borderColor}`,
        overflow:    'hidden',
        marginBottom: 10,
        position:    'relative',
        transition:  'border-color 200ms ease',
      }}
    >
      {/* Priority strip */}
      <div style={{ height: 3, background: meta.strip }} />

      <div style={{ padding: '10px 12px 12px' }}>
        {/* Top row: badge · pin · delete */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-cinzel"
            style={{ fontSize: '8px', letterSpacing: '0.18em', color: meta.badge }}
          >
            {note.priority}
          </span>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={() => onTogglePin(note.id)}
              title="Pin"
              style={{
                fontSize:   '11px',
                color:      note.pinned ? 'var(--gold)' : 'var(--faint)',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    '2px 3px',
                lineHeight: 1,
              }}
            >
              ◆
            </motion.button>

            <button
              onClick={() => onMovePriority(note.id, 'up')}
              title="Increase priority"
              style={{ fontSize: '10px', color: 'var(--faint)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 2px', lineHeight: 1 }}
            >
              ↑
            </button>

            <button
              onClick={() => onMovePriority(note.id, 'down')}
              title="Decrease priority"
              style={{ fontSize: '10px', color: 'var(--faint)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 2px', lineHeight: 1 }}
            >
              ↓
            </button>

            <button
              onClick={() => onDelete(note.id)}
              title="Delete"
              style={{
                fontSize:   '16px',
                color:      'var(--faint)',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    '1px 3px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Title */}
        <EditableField
          value={note.title}
          onChange={(v) => onUpdate(note.id, { title: v })}
          placeholder="Title..."
          className="font-cormorant"
          style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'block' }}
        />

        {/* Content — 3 lines display, expands on edit */}
        <EditableField
          value={note.content}
          onChange={(v) => onUpdate(note.id, { content: v })}
          placeholder="Write here..."
          multiline
          className="font-garamond"
          style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="font-mono"
                style={{
                  fontSize:   '9px',
                  color:      'var(--faint)',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    0,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Date */}
        <p className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)', marginTop: 8 }}>
          {new Date(note.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Add note inline form — slides in with Framer Motion
───────────────────────────────────────────── */
function AddNoteForm({ priority, onAdd, onClose }) {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    await onAdd({ title, content, priority, tags })
    onClose()
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <motion.div
      key="add-form"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: 'hidden', marginBottom: 10 }}
    >
      <div
        style={{ background: '#13110E', border: '1px solid var(--gold)', padding: '14px 16px' }}
        onKeyDown={handleKeyDown}
      >
        {/* Title */}
        <input
          autoFocus
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-cormorant"
          style={{
            fontSize:    '16px',
            fontWeight:  600,
            color:       'var(--text)',
            background:  'transparent',
            border:      'none',
            outline:     'none',
            borderBottom: '1px solid var(--divider)',
            width:       '100%',
            marginBottom: 10,
            paddingBottom: 6,
            display:     'block',
          }}
        />

        {/* Content */}
        <textarea
          placeholder="What's on your mind..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-garamond"
          rows={4}
          style={{
            fontSize:   '14px',
            color:      'var(--muted)',
            lineHeight: 1.65,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            width:      '100%',
            resize:     'none',
            display:    'block',
          }}
        />

        {/* Tags */}
        <input
          placeholder="Tags: work, urgent, idea"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          className="font-mono"
          style={{
            fontSize:    '10px',
            color:       'var(--faint)',
            background:  'transparent',
            border:      'none',
            outline:     'none',
            borderTop:   '1px solid var(--divider)',
            width:       '100%',
            marginTop:   8,
            paddingTop:  8,
            display:     'block',
          }}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={onClose}
            className="font-cinzel"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.15em',
              color:         'var(--muted)',
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              padding:       '5px 0',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="font-cinzel"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.15em',
              color:         'var(--gold)',
              background:    'none',
              border:        '1px solid var(--gold)',
              cursor:        'pointer',
              padding:       '5px 14px',
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Desktop column
───────────────────────────────────────────── */
function Column({ priority, notes, onAdd, onUpdate, onDelete, onTogglePin, onTagClick, onMovePriority, isLast }) {
  const meta    = META[priority]
  const [adding, setAdding] = useState(false)

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div
      className="flex flex-col flex-1 min-w-0"
      style={{ borderRight: isLast ? 'none' : '1px solid var(--border)' }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 py-3"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 5, height: 5, background: meta.strip, flexShrink: 0 }} />
          <span
            className="font-cinzel uppercase"
            style={{ fontSize: '9px', color: meta.badge, letterSpacing: '0.22em' }}
          >
            {priority}
          </span>
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)' }}>
            {notes.length}
          </span>
        </div>

        <button
          onClick={() => setAdding((p) => !p)}
          style={{
            fontSize:   '20px',
            lineHeight: 1,
            color:      adding ? 'var(--gold)' : 'var(--muted)',
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            padding:    '0 2px',
            transition: 'color 150ms ease',
          }}
        >
          +
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pt-3">
        <AnimatePresence>
          {adding && (
            <AddNoteForm
              priority={priority}
              onAdd={onAdd}
              onClose={() => setAdding(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {sorted.length === 0 && !adding && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-cormorant italic"
              style={{ fontSize: '15px', color: 'var(--faint)', textAlign: 'center', marginTop: 32 }}
            >
              No notes yet. Click + to add one.
            </motion.p>
          )}
          {sorted.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onTagClick={onTagClick}
              onMovePriority={onMovePriority}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function StickyNotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote, togglePin, movePriority } = useStickyNotes()
  const isMobile = useIsMobile()

  const [search,          setSearch]          = useState('')
  const [activeTag,       setActiveTag]       = useState(null)
  const [activeMobileTab, setActiveMobileTab] = useState('HIGH')
  const [mobileAdding,    setMobileAdding]    = useState(false)

  const handleTagClick = (tag) => setActiveTag((prev) => (prev === tag ? null : tag))

  /* Filter by search + active tag */
  const filtered = notes.filter((n) => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q
      || (n.title   || '').toLowerCase().includes(q)
      || (n.content || '').toLowerCase().includes(q)
      || (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(q)))
    const matchTag = !activeTag
      || (Array.isArray(n.tags) && n.tags.includes(activeTag))
    return matchSearch && matchTag
  })

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p className="font-cinzel" style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--faint)' }}>
          — loading —
        </p>
      </div>
    )
  }

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
      <div className="flex-shrink-0 px-4 pt-4 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <p
              className="font-cinzel uppercase"
              style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}
            >
              Epistulae
            </p>
            <p
              className="font-cormorant"
              style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}
            >
              Command Board
            </p>
          </div>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--faint)', marginTop: 8 }}>
            {notes.length} notes
          </span>
        </div>

        {/* Search bar */}
        <div style={{ marginTop: 12 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input-underline font-garamond"
            style={{ fontSize: '14px', width: '100%' }}
          />

          {/* Active filters */}
          {(search || activeTag) && (
            <div className="flex items-center gap-4 mt-2">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="font-mono"
                  style={{ fontSize: '9px', color: 'var(--faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  clear search
                </button>
              )}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="font-mono"
                  style={{ fontSize: '9px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  #{activeTag} ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <OrnamentalDivider opacity={0.12} />

      {/* ── Mobile: priority tab switcher ── */}
      {isMobile && (
        <div
          className="flex flex-shrink-0"
          style={{ borderBottom: '1px solid var(--divider)' }}
        >
          {PRIORITIES.map((p) => {
            const meta   = META[p]
            const count  = filtered.filter((n) => n.priority === p).length
            const active = activeMobileTab === p
            return (
              <button
                key={p}
                onClick={() => { setActiveMobileTab(p); setMobileAdding(false) }}
                className="flex-1 py-3"
                style={{
                  background:   'none',
                  border:       'none',
                  borderBottom: `2px solid ${active ? meta.strip : 'transparent'}`,
                  cursor:       'pointer',
                }}
              >
                <span
                  className="font-cinzel uppercase"
                  style={{ fontSize: '9px', color: active ? meta.badge : 'var(--faint)', letterSpacing: '0.15em' }}
                >
                  {p}
                </span>
                <span className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)', marginLeft: 5 }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          MOBILE VIEW — single-column, tabbed
      ══════════════════════════════════════ */}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: 88 }}>
          <AnimatePresence>
            {mobileAdding && (
              <AddNoteForm
                priority={activeMobileTab}
                onAdd={addNote}
                onClose={() => setMobileAdding(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {filtered.filter((n) => n.priority === activeMobileTab).length === 0 && !mobileAdding && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-cormorant italic"
                style={{ fontSize: '15px', color: 'var(--faint)', textAlign: 'center', marginTop: 32 }}
              >
                No notes yet. Click + to add one.
              </motion.p>
            )}
            {filtered
              .filter((n) => n.priority === activeMobileTab)
              .sort((a, b) => {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
                return new Date(b.created_at) - new Date(a.created_at)
              })
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onTagClick={handleTagClick}
                  onMovePriority={movePriority}
                />
              ))
            }
          </AnimatePresence>
        </div>

      ) : (
        /* ══════════════════════════════════════
           DESKTOP VIEW — 3 equal columns
        ══════════════════════════════════════ */
        <div
          className="flex flex-1 min-h-0"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {PRIORITIES.map((priority, idx) => (
            <Column
              key={priority}
              priority={priority}
              notes={filtered.filter((n) => n.priority === priority)}
              onAdd={addNote}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onTogglePin={togglePin}
              onTagClick={handleTagClick}
              onMovePriority={movePriority}
              isLast={idx === PRIORITIES.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Mobile FAB ── */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setMobileAdding((p) => !p)}
          style={{
            position:       'fixed',
            bottom:         80,
            right:          20,
            width:          52,
            height:         52,
            borderRadius:   '50%',
            background:     'var(--gold)',
            color:          '#0C0A08',
            fontSize:       '26px',
            lineHeight:     1,
            border:         'none',
            cursor:         'pointer',
            boxShadow:      '0 4px 20px rgba(201,168,76,0.4)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            zIndex:         40,
            fontFamily:     'Cinzel, serif',
          }}
        >
          +
        </motion.button>
      )}
    </motion.div>
  )
}
