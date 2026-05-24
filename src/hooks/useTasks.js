import { useLocalStorage } from './useLocalStorage'
import { isToday } from 'date-fns'

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('tasks', [])

  const addTask = (task) =>
    setTasks((prev) => [
      {
        id:              task.id || `t${Date.now()}`,
        title:           task.title,
        priority:        task.priority || 'medium',
        goalId:          task.goalId || null,
        linkedSubtaskId: task.linkedSubtaskId || null,
        dueDate:         task.dueDate || null,
        completed:       false,
        completedAt:     null,
        createdAt:       new Date().toISOString(),
        source:          task.source || 'manual',
      },
      ...prev,
    ])

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t
      )
    )

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const updateTask = (id, updates) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

  const tasksCompletedToday = tasks.filter(
    (t) => t.completed && t.completedAt && isToday(new Date(t.completedAt))
  ).length

  return { tasks, addTask, toggleTask, deleteTask, updateTask, tasksCompletedToday }
}
