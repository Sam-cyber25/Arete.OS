import { useState } from 'react'
import { X }        from 'lucide-react'
import { useApp }   from '../../context/AppContext'
import Modal        from '../ui/Modal'

export default function AddTaskModal({ open, onClose }) {
  const { addTask, goals, showToast } = useApp()
  const [form, setForm] = useState({ title: '', priority: 'medium', goalId: '', dueDate: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTask({ ...form, goalId: form.goalId || null, dueDate: form.dueDate || null })
    showToast('Task added!')
    setForm({ title: '', priority: 'medium', goalId: '', dueDate: '' })
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
          New Task
        </h2>
        <button onClick={onClose} className="opacity-50 hover:opacity-100">
          <X size={18} style={{ color: '#64748b' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs mb-1.5 block" style={{ fontFamily: 'Syne, sans-serif', color: '#64748b' }}>
            Task Title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border    : '1px solid rgba(255,255,255,0.1)',
              color     : '#f1f5f9',
              fontFamily: 'Syne, sans-serif',
            }}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1.5 block" style={{ fontFamily: 'Syne, sans-serif', color: '#64748b' }}>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border    : '1px solid rgba(255,255,255,0.1)',
                color     : '#f1f5f9',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ fontFamily: 'Syne, sans-serif', color: '#64748b' }}>
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
              style={{
                background : 'rgba(255,255,255,0.05)',
                border     : '1px solid rgba(255,255,255,0.1)',
                color      : '#f1f5f9',
                fontFamily : 'Syne, sans-serif',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ fontFamily: 'Syne, sans-serif', color: '#64748b' }}>
            Link to Goal (optional)
          </label>
          <select
            value={form.goalId}
            onChange={(e) => setForm((p) => ({ ...p, goalId: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border    : '1px solid rgba(255,255,255,0.1)',
              color     : '#f1f5f9',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            <option value="">No goal</option>
            {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            color     : '#fff',
            fontFamily: 'Syne, sans-serif',
            boxShadow : '0 0 20px rgba(59,130,246,0.3)',
          }}
        >
          Add Task
        </button>
      </form>
    </Modal>
  )
}
