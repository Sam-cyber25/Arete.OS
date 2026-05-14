import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'

export default function AddNotePanel({ open, onClose }) {
  const { addNote, showToast } = useApp()
  const [form, setForm] = useState({ title: '', content: '', tags: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.content.trim()) return
    addNote({
      title:   form.title.trim(),
      content: form.content.trim(),
      tags:    form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      source:  'manual',
    })
    showToast('Saved to memory')
    setForm({ title: '', content: '', tags: '' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="add-note-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            background:   'var(--surface)',
            borderTop:    '1px solid rgba(201,168,76,0.35)',
            padding:      '32px 40px 40px',
            maxHeight:    '60vh',
            overflowY:    'auto',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: 640, margin: '0 auto 32px' }}
          >
            <p
              className="font-cinzel uppercase tracking-widest"
              style={{ fontSize: '11px', color: 'var(--text)', letterSpacing: '0.25em' }}
            >
              New Memory
            </p>
            <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onClose}>
              Close
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ maxWidth: 640, margin: '0 auto' }}
            className="flex flex-col gap-6"
          >
            {/* Title */}
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Title</p>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Subject or heading..."
                className="input-underline font-cormorant"
                style={{ fontSize: '20px' }}
                autoFocus
              />
            </div>

            {/* Content */}
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Content</p>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Record what must be remembered..."
                className="textarea-journal"
                rows={5}
              />
            </div>

            {/* Tags */}
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Tags</p>
              <input
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="stoic, strategy, insight — comma separated"
                className="input-underline font-garamond"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div className="flex justify-end gap-3" style={{ marginTop: 8 }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Commit to Memory
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
