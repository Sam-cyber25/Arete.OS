import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import TaskItem                     from './TaskItem'
import { isToday, isThisWeek }      from 'date-fns'

/* Styled date input matching app design */
function DateInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="font-mono"
      style={{
        background:   'transparent',
        border:       'none',
        borderBottom: `1px solid ${focused ? 'var(--gold)' : '#2A2520'}`,
        color:        value ? 'var(--text)' : 'var(--faint)',
        fontSize:     '12px',
        padding:      '8px 0',
        outline:      'none',
        colorScheme:  'dark',
        width:        120,
        transition:   'border-color 180ms ease',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

/* Styled goal dropdown */
function GoalSelect({ value, onChange, goals, style }) {
  const [focused, setFocused] = useState(false)
  const selected = value && goals.find((g) => g.id === value)
  return (
    <div style={{ position: 'relative', ...style }}>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          appearance:       'none',
          WebkitAppearance: 'none',
          background:       '#13110E',
          border:           `1px solid ${focused || selected ? 'var(--gold)' : '#2A2520'}`,
          color:            selected ? 'var(--gold)' : 'var(--muted)',
          fontFamily:       '"EB Garamond", serif',
          fontSize:         '14px',
          padding:          '6px 28px 6px 10px',
          outline:          'none',
          cursor:           'pointer',
          width:            '100%',
          transition:       'border-color 180ms ease',
        }}
      >
        <option value="">— No Goal —</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>{g.title}</option>
        ))}
      </select>
      <span style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', fontSize: '10px',
        color: selected ? 'var(--gold)' : 'var(--faint)',
      }}>▾</span>
    </div>
  )
}

const FILTERS = ['All', 'Today', 'This Week', 'By Goal']

export default function TaskList() {
  const { tasks, goals, addTask, addSubtask, showToast } = useApp()
  const [filter,     setFilter]     = useState('All')
  const [goalFilter, setGoalFilter] = useState('')
  const [showDone,   setShowDone]   = useState(false)
  // Inline add
  const [newTitle,    setNewTitle]    = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newGoalId,   setNewGoalId]   = useState('')
  const [newDueDate,  setNewDueDate]  = useState('')

  const pending = tasks.filter((t) => !t.completed)
  const done    = tasks.filter((t) =>  t.completed)

  const applyFilter = (list) => {
    if (filter === 'Today')     return list.filter((t) => t.dueDate && isToday(new Date(t.dueDate)))
    if (filter === 'This Week') return list.filter((t) => t.dueDate && isThisWeek(new Date(t.dueDate), { weekStartsOn: 1 }))
    if (filter === 'By Goal' && goalFilter) return list.filter((t) => t.goalId === goalFilter)
    return list
  }

  const filteredPending = applyFilter(pending)
  const filteredDone    = applyFilter(done)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const selectedGoal = newGoalId ? goals.find((g) => g.id === newGoalId) : null

    if (selectedGoal) {
      const taskId    = `t${Date.now()}`
      const subtaskId = `st${Date.now() + 1}`
      addTask({
        id:              taskId,
        title:           newTitle.trim(),
        priority:        newPriority,
        goalId:          newGoalId,
        linkedSubtaskId: subtaskId,
        dueDate:         newDueDate || null,
      })
      addSubtask(newGoalId, newTitle.trim(), subtaskId, taskId)
      showToast(`Added to "${selectedGoal.title}" subtasks`)
    } else {
      addTask({ title: newTitle.trim(), priority: newPriority, goalId: null, dueDate: newDueDate || null })
      showToast('Task added')
    }

    setNewTitle(''); setNewDueDate(''); setNewGoalId('')
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="font-cinzel uppercase transition-colors"
            style={{
              fontSize:      '11px',
              letterSpacing: '0.18em',
              color:         filter === f ? 'var(--gold)' : 'var(--muted)',
              borderBottom:  filter === f ? '1px solid var(--gold)' : '1px solid transparent',
              paddingBottom: 2,
            }}
          >
            {f}
          </button>
        ))}
        {filter === 'By Goal' && (
          <GoalSelect
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            goals={goals}
            style={{ minWidth: 180 }}
          />
        )}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-0" style={{ marginBottom: 24 }}>
        <AnimatePresence mode="popLayout">
          {filteredPending.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-garamond italic"
              style={{ color: 'var(--muted)', fontSize: '15px', paddingTop: 16 }}
            >
              {filter === 'All' ? 'No pending tasks.' : 'No tasks match this filter.'}
            </motion.p>
          ) : (
            filteredPending.map((t) => <TaskItem key={t.id} task={t} />)
          )}
        </AnimatePresence>
      </div>

      {/* Inline add form */}
      <form onSubmit={handleAdd} style={{ borderTop: '1px solid var(--divider)', paddingTop: 20, marginBottom: 24 }}>
        <p className="section-label" style={{ marginBottom: 14 }}>Add Task</p>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What must be done..."
          className="input-underline font-garamond"
          style={{ fontSize: '16px', marginBottom: 14 }}
          autoComplete="off"
        />
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Priority</p>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className="btn-secondary capitalize"
                  style={{
                    padding: '5px 12px', fontSize: '9px',
                    color:       newPriority === p ? 'var(--gold)' : 'var(--muted)',
                    borderColor: newPriority === p ? 'var(--gold)' : 'var(--border)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Due date</p>
            <DateInput value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          </div>
          <div style={{ minWidth: 180 }}>
            <p className="section-label" style={{ marginBottom: 6 }}>Goal (optional)</p>
            <GoalSelect
              value={newGoalId}
              onChange={(e) => setNewGoalId(e.target.value)}
              goals={goals}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
            Add Task
          </button>
        </div>
      </form>

      {/* Completed section */}
      {filteredDone.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone((p) => !p)}
            className="font-cinzel uppercase toggle-link"
            style={{
              fontSize: '9px', letterSpacing: '0.18em',
              color: 'var(--gold)', marginBottom: 12,
            }}
          >
            {showDone ? 'Hide' : 'Show'} Completed ({filteredDone.length})
          </button>
          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-0 overflow-hidden"
              >
                {filteredDone.slice(0, 10).map((t) => <TaskItem key={t.id} task={t} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
