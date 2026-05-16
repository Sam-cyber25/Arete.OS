import { memo, useState }           from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import { useIsMobile }              from '../../hooks/useIsMobile'

const STATUS_OPTIONS = ['Active', 'Paused', 'Completed']

const GoalCard = memo(function GoalCard({ goal }) {
  const { updateGoal, deleteGoal, addSubtask, toggleSubtask, deleteSubtask, showToast } = useApp()
  const isMobile                    = useIsMobile()
  const [expanded,   setExpanded]   = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [editData,   setEditData]   = useState({ title: goal.title, notes: goal.notes || '' })
  const [newSubtask, setNewSubtask] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  const subtasks = goal.subtasks || []
  const doneCount = subtasks.filter((s) => s.completed).length

  const handleSave = () => {
    updateGoal(goal.id, { title: editData.title, notes: editData.notes })
    setEditing(false)
    showToast('Goal updated')
  }

  const handleDelete = () => {
    if (confirmDel) { deleteGoal(goal.id); showToast('Goal removed', 'error') }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000) }
  }

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (!newSubtask.trim()) return
    addSubtask(goal.id, newSubtask.trim())
    setNewSubtask('')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 20, marginBottom: 4 }}
    >
      {/* Main row */}
      <div className="flex items-start gap-4">
        {/* Progress % — click to expand */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="font-mono flex-shrink-0 text-right transition-colors"
          style={{
            fontSize:  '12px',
            color:     expanded ? 'var(--gold)' : 'var(--muted)',
            width:     36,
            marginTop: 4,
          }}
        >
          {goal.progress}%
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editData.title}
              onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
              className="input-underline font-cormorant"
              style={{ fontSize: '18px', fontWeight: 600, marginBottom: 8 }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="font-cormorant text-left w-full"
              style={{ fontSize: '18px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}
            >
              {goal.title}
            </button>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3">
            <span className="font-cinzel uppercase" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.16em' }}>
              {goal.category}
            </span>
            <span style={{ color: 'var(--faint)', fontSize: '10px' }}>·</span>
            <span className="font-cinzel uppercase" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.16em' }}>
              {goal.target}
            </span>
            <span style={{ color: 'var(--faint)', fontSize: '10px' }}>·</span>
            <span
              className="font-cinzel uppercase"
              style={{
                fontSize:      '9px',
                letterSpacing: '0.16em',
                color: goal.status === 'Active'    ? 'var(--success)' :
                       goal.status === 'Completed' ? 'var(--gold)' : 'var(--muted)',
              }}
            >
              {goal.status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-track" style={{ marginTop: 10 }}>
            <motion.div
              className="progress-fill"
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {editing ? (
            <>
              <button className="btn-ghost icon-btn" style={{ fontSize: '9px', minHeight: 'unset' }} onClick={handleSave}>Save</button>
              <button className="btn-ghost icon-btn" style={{ fontSize: '9px', minHeight: 'unset' }} onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : isMobile ? (
            /* ── Mobile: ⋯ dropdown menu ── */
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                style={{
                  fontSize: '20px', color: 'var(--muted)', padding: '2px 6px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  lineHeight: 1, minHeight: 'unset',
                }}
                onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p) }}
              >
                ⋯
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute', right: 0, top: '100%', zIndex: 30,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      minWidth: 110,
                    }}
                  >
                    <button
                      className="btn-ghost icon-btn"
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', fontSize: '9px', minHeight: 'unset',
                      }}
                      onClick={() => { setEditing(true); setMenuOpen(false) }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-ghost icon-btn"
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', fontSize: '9px', minHeight: 'unset',
                        color: confirmDel ? 'var(--danger)' : undefined,
                      }}
                      onClick={() => { handleDelete(); setMenuOpen(false) }}
                    >
                      {confirmDel ? 'Confirm?' : 'Delete'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Desktop: inline buttons ── */
            <>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setEditing(true)}>Edit</button>
              <button
                className="btn-ghost"
                style={{ fontSize: '9px', color: confirmDel ? 'var(--danger)' : undefined }}
                onClick={handleDelete}
              >
                {confirmDel ? 'Confirm' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', marginLeft: 52, marginTop: 16 }}
          >
            {/* Status buttons */}
            {!editing && (
              <div className="flex gap-2 mb-5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateGoal(goal.id, { status: s })}
                    className="btn-secondary"
                    style={{
                      padding:     '5px 14px',
                      fontSize:    '9px',
                      color:       goal.status === s ? 'var(--gold)' : 'var(--muted)',
                      borderColor: goal.status === s ? 'var(--gold)' : 'var(--border)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Notes edit */}
            {editing && (
              <div style={{ marginBottom: 16 }}>
                <p className="section-label" style={{ marginBottom: 8 }}>Notes</p>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData((p) => ({ ...p, notes: e.target.value }))}
                  className="textarea-journal"
                  rows={3}
                  placeholder="Notes on this goal..."
                />
              </div>
            )}
            {!editing && goal.notes && (
              <div style={{ marginBottom: 16 }}>
                <p className="section-label" style={{ marginBottom: 8 }}>Notes</p>
                <p className="font-garamond" style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7 }}>
                  {goal.notes}
                </p>
              </div>
            )}

            {/* Subtasks */}
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">Subtasks</p>
              {subtasks.length > 0 && (
                <p className="font-mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {doneCount} / {subtasks.length} complete
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {subtasks.map((st) => (
                <div key={st.id} className="group flex items-center gap-3">
                  {/* Circle checkbox */}
                  <button
                    className={`subtask-circle${st.completed ? ' done' : ''}`}
                    onClick={() => toggleSubtask(goal.id, st.id)}
                  />
                  <span
                    className="font-garamond flex-1"
                    style={{
                      fontSize: '15px',
                      color:    st.completed ? 'var(--muted)' : 'var(--text)',
                      opacity:  st.completed ? 0.55 : 1,
                    }}
                  >
                    {st.title}
                  </span>
                  {/* Delete subtask — appears on hover */}
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity font-mono"
                    style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}
                    onClick={() => deleteSubtask(goal.id, st.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask */}
            <form onSubmit={handleAddSubtask} className="flex gap-3">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask and press Enter..."
                className="input-underline flex-1 font-garamond"
                style={{ fontSize: '14px' }}
              />
              <button type="submit" className="btn-ghost" style={{ fontSize: '9px', flexShrink: 0 }}>
                +
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default GoalCard
