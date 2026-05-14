import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import TaskItem                     from './TaskItem'
import { isToday, isThisWeek }      from 'date-fns'

const FILTERS = ['All', 'Today', 'This Week', 'By Goal']

export default function TaskList() {
  const { tasks, goals, addTask, showToast } = useApp()
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
    addTask({ title: newTitle.trim(), priority: newPriority, goalId: newGoalId || null, dueDate: newDueDate || null })
    showToast('Task added')
    setNewTitle(''); setNewDueDate('')
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
              fontSize: '9px',
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
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="input-box font-garamond"
            style={{ fontSize: '13px', padding: '4px 10px', width: 'auto' }}
          >
            <option value="">All Goals</option>
            {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
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
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input-box font-mono"
              style={{ fontSize: '12px', padding: '6px 10px', width: 'auto' }}
            />
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Goal (optional)</p>
            <select
              value={newGoalId}
              onChange={(e) => setNewGoalId(e.target.value)}
              className="input-box font-garamond"
              style={{ fontSize: '13px', padding: '6px 10px', width: 'auto' }}
            >
              <option value="">None</option>
              {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
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
