import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'

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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(12,10,8,0.85)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
            style={{
              background: 'var(--surface)',
              border:     '1px solid var(--border)',
              borderTop:  '1px solid rgba(201,168,76,0.4)',
              padding:    36,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <p className="font-cinzel uppercase tracking-widest" style={{ color: 'var(--text)', fontSize: '12px', letterSpacing: '0.22em' }}>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
