import { memo }     from 'react'
import { motion }    from 'framer-motion'
import { useApp }    from '../../context/AppContext'
import { format }    from 'date-fns'

const TaskItem = memo(function TaskItem({ task }) {
  const { toggleTask, deleteTask, showToast } = useApp()

  const handleToggle = () => {
    toggleTask(task.id)
    if (!task.completed) showToast('Marked complete')
  }

  const handleDelete = () => {
    deleteTask(task.id)
    showToast('Task removed', 'error')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: task.completed ? 0.45 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 group"
      style={{ paddingBottom: 14, borderBottom: '1px solid var(--divider)' }}
    >
      {/* Dot checkbox */}
      <button className={`task-dot ${task.completed ? 'done' : ''}`} onClick={handleToggle} />

      {/* Title */}
      <span
        className="font-garamond flex-1"
        style={{ fontSize: '16px', color: 'var(--text)' }}
      >
        {task.title}
      </span>

      {/* Priority mark */}
      <span
        className="font-cinzel uppercase flex-shrink-0"
        style={{
          fontSize: '8px',
          letterSpacing: '0.14em',
          color: task.priority === 'high'   ? 'var(--danger)'  :
                 task.priority === 'medium' ? 'var(--bronze)'  : 'var(--success)',
        }}
      >
        {task.priority}
      </span>

      {/* Due date */}
      {task.dueDate && (
        <span
          className="font-mono flex-shrink-0"
          style={{ fontSize: '10px', color: 'var(--faint)' }}
        >
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ fontSize: '8px', color: 'var(--danger)', letterSpacing: '0.12em' }}
      >
        Remove
      </button>
    </motion.div>
  )
})

export default TaskItem
