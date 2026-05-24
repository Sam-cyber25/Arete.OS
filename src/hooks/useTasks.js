import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { isToday }             from 'date-fns'

/*
 * DB schema: id, user_id, name, priority, due_date, goal_id, completed, completed_at, created_at
 * UI shape:  id, title,   priority, dueDate,  goalId,   completed, completedAt,  createdAt
 */
function toUI(row) {
  return {
    id:          row.id,
    title:       row.name         ?? '',   // DB: name → UI: title
    priority:    row.priority     ?? 'medium',
    goalId:      row.goal_id      ?? null,
    dueDate:     row.due_date     ?? null,
    completed:   row.completed    ?? false,
    completedAt: row.completed_at ?? null,
    createdAt:   row.created_at,
    /* linkedSubtaskId kept in UI shape for in-session cross-link; not persisted */
    linkedSubtaskId: null,
  }
}

/* UI camelCase → DB snake_case */
function toDB(t) {
  return {
    name:        t.title    ?? '',
    priority:    t.priority ?? 'medium',
    goal_id:     t.goalId   ?? null,
    due_date:    t.dueDate  ?? null,
    completed:   t.completed  ?? false,
    completed_at: t.completedAt ?? null,
  }
}

export function useTasks() {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTasks((data || []).map(toUI))
    setLoading(false)
  }

  const addTask = async (task) => {
    const { data: { user } } = await supabase.auth.getUser()
    const row = { ...toDB(task), user_id: user.id }
    const { data, error } = await supabase
      .from('tasks')
      .insert(row)
      .select()
      .single()
    if (!error) {
      /* Preserve in-session linkedSubtaskId so cross-link works until reload */
      const ui = { ...toUI(data), linkedSubtaskId: task.linkedSubtaskId ?? null }
      setTasks((prev) => [ui, ...prev])
      return ui
    }
    return null
  }

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const updates = task.completed
      ? { completed: false, completed_at: null }
      : { completed: true,  completed_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      /* Preserve in-session linkedSubtaskId */
      setTasks((prev) => prev.map((t) =>
        t.id === id ? { ...toUI(data), linkedSubtaskId: t.linkedSubtaskId } : t
      ))
    }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTask = async (id, updates) => {
    const dbUpdates = {}
    if ('title'       in updates) dbUpdates.name         = updates.title
    if ('priority'    in updates) dbUpdates.priority     = updates.priority
    if ('goalId'      in updates) dbUpdates.goal_id      = updates.goalId
    if ('dueDate'     in updates) dbUpdates.due_date     = updates.dueDate
    if ('completed'   in updates) dbUpdates.completed    = updates.completed
    if ('completedAt' in updates) dbUpdates.completed_at = updates.completedAt
    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setTasks((prev) => prev.map((t) =>
        t.id === id ? { ...toUI(data), linkedSubtaskId: t.linkedSubtaskId } : t
      ))
    }
  }

  const tasksCompletedToday = tasks.filter(
    (t) => t.completed && t.completedAt && isToday(new Date(t.completedAt))
  ).length

  return { tasks, loading, addTask, toggleTask, deleteTask, updateTask, tasksCompletedToday, refetch: fetchTasks }
}
