import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import Modal        from '../ui/Modal'

export default function AddNotePanel({ open, onClose }) {
  const { addNote, showToast } = useApp()
  const [form, setForm] = useState({ title: '', content: '', tags: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.content.trim()) return
    addNote({
      title  : form.title.trim(),
      content: form.content.trim(),
      tags   : form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      source : 'manual',
    })
    showToast('Saved to memory')
    setForm({ title: '', content: '', tags: '' })
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={onClose} bottomSheet>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
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
        className="flex flex-col gap-6"
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
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
    </Modal>
  )
}
