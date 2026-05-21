import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import Modal        from '../ui/Modal'

const CATEGORIES = ['Academic', 'Business', 'Health', 'Spiritual', 'Combat', 'Self', 'Other']

export default function AddGoalModal({ open, onClose }) {
  const { addGoal, showToast } = useApp()
  const [form, setForm] = useState({ title: '', category: 'Self', target: 'Ongoing' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addGoal(form)
    showToast('Goal created')
    setForm({ title: '', category: 'Self', target: 'Ongoing' })
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-8">
        <p className="font-cinzel uppercase" style={{ color: 'var(--text)', fontSize: '12px', letterSpacing: '0.22em' }}>
          New Goal
        </p>
        <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onClose}>Close</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Title</p>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What will you conquer?"
            className="input-underline font-cormorant"
            style={{ fontSize: '20px' }}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Category</p>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="input-box font-garamond"
              style={{ fontSize: '15px' }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Target</p>
            <input
              value={form.target}
              onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
              placeholder="May 2026 / Ongoing"
              className="input-box font-garamond"
              style={{ fontSize: '15px' }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Create Goal</button>
        </div>
      </form>
    </Modal>
  )
}
