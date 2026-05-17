import { useState, useMemo }         from 'react'
import { motion, AnimatePresence }    from 'framer-motion'
import { format }                     from 'date-fns'
import { useBooks }                   from '../hooks/useBooks'
import { useIsMobile }                from '../hooks/useIsMobile'
import OrnamentalDivider              from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']
const STATUS_TABS = ['ALL', 'READING', 'COMPLETED', 'QUEUED']

const STATUS_COLORS = {
  READING:   '#5C7A8A',
  COMPLETED: '#4A6741',
  QUEUED:    '#8A7A65',
}

/* ─── Book Form ────────────────────────────────────────────── */
function BookForm({ initial, onSave, onCancel, isMobile }) {
  const blank = { title: '', author: '', totalPages: '', status: 'QUEUED', pagesRead: 0, startedAt: '', notes: '' }
  const [form, setForm] = useState(initial ? {
    ...blank, ...initial,
    totalPages: String(initial.totalPages || ''),
    pagesRead:  initial.pagesRead || 0,
    startedAt:  initial.startedAt ? format(new Date(initial.startedAt), 'yyyy-MM-dd') : '',
  } : blank)

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      ...form,
      totalPages: Number(form.totalPages) || 0,
      pagesRead:  Number(form.pagesRead)  || 0,
      startedAt:  form.startedAt ? new Date(form.startedAt).toISOString() : null,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     1000,
        display:    'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        background: 'rgba(12,10,8,0.80)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: isMobile ? 40 : 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: isMobile ? 40 : 16, opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'var(--surface)',
          borderTop:  '1px solid rgba(201,168,76,0.4)',
          padding:    '20px 24px 36px',
          width:      '100%',
          maxWidth:   isMobile ? undefined : 560,
          maxHeight:  '88vh',
          overflowY:  'auto',
          zIndex:     1001,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.24em' }}>
            {initial ? 'Edit Book' : 'Add to Codex'}
          </p>
          <button className="icon-btn" onClick={onCancel} style={{ fontSize: '20px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'unset', lineHeight: 1 }}>×</button>
        </div>

        <input
          value={form.title}
          onChange={(e) => upd('title', e.target.value)}
          placeholder="Book title..."
          className="input-underline font-cormorant"
          style={{ fontSize: '18px', marginBottom: 12 }}
          autoFocus
        />
        <input
          value={form.author}
          onChange={(e) => upd('author', e.target.value)}
          placeholder="Author name..."
          className="input-underline font-garamond"
          style={{ fontSize: '14px', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <p className="section-label" style={{ marginBottom: 6 }}>Total Pages</p>
            <input
              type="number" min="0"
              value={form.totalPages}
              onChange={(e) => upd('totalPages', e.target.value)}
              className="input-box font-mono"
              style={{ fontSize: '14px', padding: '6px 10px', width: '100%', minHeight: 'unset' }}
            />
          </div>
          {form.status === 'READING' && (
            <div style={{ flex: 1, minWidth: 100 }}>
              <p className="section-label" style={{ marginBottom: 6 }}>Pages Read</p>
              <input
                type="number" min="0"
                value={form.pagesRead}
                onChange={(e) => upd('pagesRead', e.target.value)}
                className="input-box font-mono"
                style={{ fontSize: '14px', padding: '6px 10px', width: '100%', minHeight: 'unset' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Status</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['READING', 'QUEUED', 'COMPLETED'].map((s) => (
              <button
                key={s}
                onClick={() => upd('status', s)}
                className="font-cinzel icon-btn uppercase"
                style={{
                  fontSize: '8px', letterSpacing: '0.12em', padding: '6px 10px',
                  border: '1px solid',
                  borderColor: form.status === s ? STATUS_COLORS[s] : 'var(--border)',
                  color:       form.status === s ? STATUS_COLORS[s] : 'var(--muted)',
                  background:  form.status === s ? `${STATUS_COLORS[s]}15` : 'transparent',
                  cursor: 'pointer', minHeight: 'unset',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {form.status === 'READING' && (
          <div style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ marginBottom: 6 }}>Started</p>
            <input
              type="date"
              value={form.startedAt}
              onChange={(e) => upd('startedAt', e.target.value)}
              className="input-box font-mono"
              style={{ fontSize: '13px', padding: '6px 10px', minHeight: 'unset' }}
            />
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>Notes</p>
          <textarea
            value={form.notes}
            onChange={(e) => upd('notes', e.target.value)}
            placeholder="Thoughts, key ideas..."
            className="textarea-journal"
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ fontSize: '9px', padding: '10px 20px' }} onClick={handleSave}>
            {initial ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Book Card ────────────────────────────────────────────── */
function BookCard({ book, onUpdate, onDelete, onEdit }) {
  const [expanded,  setExpanded]  = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const accentColor = STATUS_COLORS[book.status] || '#8A7A65'

  const pct = book.totalPages > 0 ? Math.round((book.pagesRead / book.totalPages) * 100) : 0

  const handleDelete = () => {
    if (confirmDel) { onDelete(book.id) }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ borderBottom: '1px solid var(--divider)', marginBottom: 0 }}
    >
      {/* Main row */}
      <div
        style={{ display: 'flex', alignItems: 'stretch', cursor: 'pointer' }}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Accent bar */}
        <div style={{ width: 3, minWidth: 3, background: accentColor, flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 16px 14px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="font-cormorant"
                style={{ fontSize: '18px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.25, marginBottom: 3 }}
              >
                {book.title}
              </p>
              <p
                className="font-garamond italic"
                style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: 8 }}
              >
                {book.author}
              </p>

              {/* Progress bar for READING books */}
              {book.status === 'READING' && book.totalPages > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div className="progress-track" style={{ marginBottom: 4 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="font-mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {book.pagesRead} / {book.totalPages} pages
                  </p>
                </div>
              )}

              {book.status === 'COMPLETED' && book.totalPages > 0 && (
                <p className="font-mono" style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: 4 }}>
                  {book.totalPages} pages
                </p>
              )}
            </div>

            {/* Status badge */}
            <span
              className="font-cinzel uppercase flex-shrink-0"
              style={{
                fontSize: '7px', letterSpacing: '0.16em',
                color: accentColor, marginTop: 2,
              }}
            >
              {book.status}
            </span>
          </div>

          {/* Rating for completed books */}
          {book.status === 'COMPLETED' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className="font-cinzel icon-btn"
                  onClick={(e) => { e.stopPropagation(); onUpdate(book.id, { rating: n }) }}
                  style={{
                    fontSize:  '10px',
                    color:     (book.rating || 0) >= n ? '#C9A84C' : 'var(--faint)',
                    minHeight: 'unset',
                    background:'transparent',
                    border:    'none',
                    cursor:    'pointer',
                    padding:   '2px 3px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {ROMAN[n]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px 19px' }}>
              {/* Dates */}
              {(book.startedAt || book.finishedAt) && (
                <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                  {book.startedAt && (
                    <span className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)' }}>
                      Started {format(new Date(book.startedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                  {book.finishedAt && (
                    <span className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)' }}>
                      Finished {format(new Date(book.finishedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              )}

              {/* Notes */}
              {book.notes && (
                <p
                  className="font-garamond"
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12, fontStyle: 'italic' }}
                >
                  {book.notes}
                </p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  className="btn-ghost"
                  style={{ fontSize: '9px' }}
                  onClick={(e) => { e.stopPropagation(); onEdit(book) }}
                >
                  Edit
                </button>
                <button
                  className="btn-ghost"
                  style={{ fontSize: '9px', color: confirmDel ? 'var(--danger)' : undefined }}
                  onClick={(e) => { e.stopPropagation(); handleDelete() }}
                >
                  {confirmDel ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function CodexPage() {
  const { books, addBook, updateBook, deleteBook, stats } = useBooks()
  const isMobile   = useIsMobile()
  const [filter,   setFilter]   = useState('ALL')
  const [formData, setFormData] = useState(null) // null | 'add' | book object

  const filtered = useMemo(() =>
    filter === 'ALL' ? books : books.filter((b) => b.status === filter),
  [books, filter])

  const handleSave = (data) => {
    if (formData === 'add') addBook(data)
    else                    updateBook(formData.id, data)
    setFormData(null)
  }

  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}>
            Bibliotheca
          </p>
          <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
            Reading Log
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '9px' }} onClick={() => setFormData('add')}>
          Add Book
        </button>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* Stats row */}
      <div
        style={{
          display:    'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border:     '1px solid var(--border)',
          background: 'var(--surface)',
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Completed',    value: stats.completed },
          { label: 'Reading',      value: stats.reading },
          { label: 'Pages Read',   value: stats.totalPages.toLocaleString() },
          { label: 'Avg Rating',   value: stats.avgRating ? `${stats.avgRating} / V` : '—' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '18px 8px',
              borderRight:    i < 3 ? '1px solid var(--divider)' : 'none',
            }}
          >
            <p className="font-mono" style={{ fontSize: '24px', color: 'var(--gold)', lineHeight: 1 }}>
              {s.value}
            </p>
            <p className="font-cinzel uppercase" style={{ fontSize: '7px', color: 'var(--faint)', letterSpacing: '0.18em', marginTop: 6, textAlign: 'center' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--divider)', marginBottom: 20 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="font-cinzel uppercase"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.18em',
              color:         filter === tab ? 'var(--gold)' : 'var(--muted)',
              paddingBottom: 12,
              paddingRight:  20,
              borderBottom:  filter === tab ? '1px solid var(--gold)' : '1px solid transparent',
              background:    'transparent',
              border:        'none',
              cursor:        'pointer',
              minHeight:     'unset',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Book list */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-garamond italic"
              style={{ color: 'var(--faint)', fontSize: '15px', padding: 24 }}
            >
              {filter === 'ALL' ? 'No books yet. Begin the codex.' : `No ${filter.toLowerCase()} books.`}
            </motion.p>
          ) : (
            filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={updateBook}
                onDelete={deleteBook}
                onEdit={(b) => setFormData(b)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Form sheet */}
      <AnimatePresence>
        {formData !== null && (
          <BookForm
            key="book-form"
            initial={formData === 'add' ? null : formData}
            onSave={handleSave}
            onCancel={() => setFormData(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
