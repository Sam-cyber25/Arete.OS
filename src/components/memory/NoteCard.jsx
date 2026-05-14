import { memo, useState }          from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import { formatTimestamp }          from '../../utils/dateHelpers'

const NoteCard = memo(function NoteCard({ note, onTagClick, onReadClick }) {
  const { updateNote, deleteNote, showToast } = useApp()
  const [editing,    setEditing]    = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [editData,   setEditData]   = useState({ title: note.title, content: note.content, tags: note.tags.join(', ') })

  const handleSave = () => {
    updateNote(note.id, {
      title:   editData.title,
      content: editData.content,
      tags:    editData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setEditing(false)
    showToast('Note updated')
  }

  const handleDelete = () => {
    if (confirmDel) { deleteNote(note.id); showToast('Note deleted', 'error') }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 20, marginBottom: 4 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editData.title}
              onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title..."
              className="input-underline font-cormorant"
              style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8 }}
              autoFocus
            />
          ) : (
            note.title && (
              <button
                onClick={() => onReadClick && onReadClick(note)}
                className="font-cormorant text-left w-full"
                style={{ fontSize: '18px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}
              >
                {note.title}
              </button>
            )
          )}
          <p
            className="font-mono"
            style={{ fontSize: '10px', color: 'var(--faint)' }}
          >
            {formatTimestamp(note.createdAt)}
            {note.source !== 'manual' && (
              <span style={{ marginLeft: 8 }}>[{note.source}]</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {editing ? (
            <>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={handleSave}>Save</button>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              {onReadClick && (
                <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => onReadClick(note)}>Read</button>
              )}
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setEditing(true)}>Edit</button>
              <button
                className="btn-ghost"
                style={{ fontSize: '9px', color: confirmDel ? 'var(--danger)' : 'var(--muted)' }}
                onClick={handleDelete}
              >
                {confirmDel ? 'Confirm?' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <textarea
          value={editData.content}
          onChange={(e) => setEditData((p) => ({ ...p, content: e.target.value }))}
          className="textarea-journal"
          rows={4}
          style={{ marginBottom: 10 }}
        />
      ) : (
        <p
          className="font-garamond line-clamp-2 mb-3"
          style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.65 }}
        >
          {note.content}
        </p>
      )}

      {/* Tags */}
      {editing ? (
        <input
          value={editData.tags}
          onChange={(e) => setEditData((p) => ({ ...p, tags: e.target.value }))}
          placeholder="Tags, comma separated..."
          className="input-underline font-garamond"
          style={{ fontSize: '13px' }}
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          {note.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick && onTagClick(tag)}
              className="font-mono transition-colors"
              style={{ fontSize: '10px', color: 'var(--faint)', letterSpacing: '0.05em' }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
})

export default NoteCard
