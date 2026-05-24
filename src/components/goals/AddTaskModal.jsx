import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import Modal        from '../ui/Modal'

export default function AddTaskModal({ open, onClose }) {
  const { addTask, addSubtask, goals, showToast } = useApp()
  const [form, setForm] = useState({ title: '', priority: 'medium', goalId: '', dueDate: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const selectedGoal = form.goalId ? goals.find((g) => g.id === form.goalId) : null

    if (selectedGoal) {
      /* Generate shared IDs so we can cross-link */
      const taskId    = `t${Date.now()}`
      const subtaskId = `st${Date.now() + 1}`

      addTask({
        id:              taskId,
        title:           form.title.trim(),
        priority:        form.priority,
        goalId:          form.goalId,
        linkedSubtaskId: subtaskId,
        dueDate:         form.dueDate || null,
      })

      addSubtask(form.goalId, form.title.trim(), subtaskId, taskId)
      showToast(`Added to "${selectedGoal.title}" subtasks`)
    } else {
      addTask({
        title:    form.title.trim(),
        priority: form.priority,
        goalId:   null,
        dueDate:  form.dueDate || null,
      })
      showToast('Task added')
    }

    setForm({ title: '', priority: 'medium', goalId: '', dueDate: '' })
    onClose()
  }

  const selectedGoal = form.goalId ? goals.find((g) => g.id === form.goalId) : null
  const goalSelected = !!selectedGoal

  return (
    <Modal isOpen={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.28em' }}>
          New Task
        </p>
        <button
          onClick={onClose}
          className="font-mono"
          style={{ fontSize: '16px', color: 'var(--faint)', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Task title */}
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Task Title</p>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What must be done..."
            className="input-underline font-garamond"
            style={{ fontSize: '16px' }}
            autoFocus
          />
        </div>

        {/* Priority */}
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Priority</p>
          <div className="flex gap-2">
            {['high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                className="btn-secondary capitalize"
                style={{
                  padding:     '5px 14px',
                  fontSize:    '9px',
                  color:       form.priority === p ? 'var(--gold)' : 'var(--muted)',
                  borderColor: form.priority === p ? 'var(--gold)' : 'var(--border)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Due Date</p>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
            className="font-mono"
            style={{
              background:   'transparent',
              border:       'none',
              borderBottom: '1px solid var(--border)',
              color:        form.dueDate ? 'var(--text)' : 'var(--faint)',
              fontSize:     '12px',
              padding:      '8px 0',
              outline:      'none',
              colorScheme:  'dark',
              width:        '100%',
              transition:   'border-color 180ms ease',
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = 'var(--gold)')}
            onBlur={(e)  => (e.target.style.borderBottomColor = 'var(--border)')}
          />
        </div>

        {/* Goal link */}
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Link to Goal</p>
          <div style={{ position: 'relative' }}>
            <select
              value={form.goalId}
              onChange={(e) => setForm((p) => ({ ...p, goalId: e.target.value }))}
              style={{
                appearance:   'none',
                WebkitAppearance: 'none',
                background:   '#13110E',
                border:       `1px solid ${goalSelected ? 'var(--gold)' : '#2A2520'}`,
                color:        goalSelected ? 'var(--gold)' : 'var(--muted)',
                fontFamily:   '"EB Garamond", serif',
                fontSize:     '14px',
                padding:      '8px 36px 8px 12px',
                width:        '100%',
                outline:      'none',
                cursor:       'pointer',
                transition:   'border-color 180ms ease',
              }}
            >
              <option value="">— No Goal —</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
            {/* Chevron */}
            <span
              style={{
                position:      'absolute',
                right:         12,
                top:           '50%',
                transform:     'translateY(-50%)',
                pointerEvents: 'none',
                fontSize:      '10px',
                color:         goalSelected ? 'var(--gold)' : 'var(--faint)',
              }}
            >
              ▾
            </span>
          </div>
          {goalSelected && (
            <p
              className="font-garamond italic"
              style={{ fontSize: '12px', color: 'var(--gold)', marginTop: 6, opacity: 0.8 }}
            >
              ◆ Will also appear in "{selectedGoal.title}" subtasks
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 4, width: '100%', padding: '12px 24px', fontSize: '11px' }}
        >
          Add Task
        </button>
      </form>
    </Modal>
  )
}
