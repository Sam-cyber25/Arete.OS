import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

/* Progress is always derived from subtasks */
function calcProgress(subtasks = []) {
  if (!subtasks.length) return 0
  return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
}

/*
 * DB schema: id, user_id, name, category, deadline, status, progress, subtasks, notes, created_at
 * UI shape:  id, title,   category, target,   status, progress, subtasks, notes, createdAt
 */
function toUI(row) {
  return {
    id:        row.id,
    title:     row.name      ?? '',   // DB: name  → UI: title
    category:  row.category  ?? '',
    target:    row.deadline  ?? '',   // DB: deadline → UI: target
    progress:  row.progress  ?? 0,
    status:    row.status    ?? 'Active',
    notes:     row.notes     ?? '',
    subtasks:  row.subtasks  ?? [],
    createdAt: row.created_at,
  }
}

/* Map UI update object to DB columns safely */
function toDBUpdates(updates) {
  const db = {}
  if ('title'    in updates) db.name     = updates.title     // UI: title → DB: name
  if ('name'     in updates) db.name     = updates.name
  if ('category' in updates) db.category = updates.category
  if ('target'   in updates) db.deadline = updates.target    // UI: target → DB: deadline
  if ('deadline' in updates) db.deadline = updates.deadline
  if ('status'   in updates) db.status   = updates.status
  if ('notes'    in updates) db.notes    = updates.notes
  if ('progress' in updates) db.progress = updates.progress
  if ('subtasks' in updates) db.subtasks = updates.subtasks
  return db
}

const DEFAULT_GOALS = [
  { name: 'AIR 1 in CBSE Class 10 Boards',           category: 'Academic',  deadline: 'May 2026', status: 'Active', notes: '', subtasks: [], progress: 0 },
  { name: 'Generate Independent Freelance Income',     category: 'Business',  deadline: 'Ongoing',  status: 'Active', notes: '', subtasks: [], progress: 0 },
  { name: 'Body Recomposition — 120g protein daily',  category: 'Health',    deadline: 'Ongoing',  status: 'Active', notes: '', subtasks: [], progress: 0 },
  { name: 'Daily Spiritual Practice',                  category: 'Spiritual', deadline: 'Ongoing',  status: 'Active', notes: '', subtasks: [], progress: 0 },
  { name: 'MMA Training — Footwork & Striking',       category: 'Combat',    deadline: 'Ongoing',  status: 'Active', notes: '', subtasks: [], progress: 0 },
  { name: 'Project Arête — Character Transformation', category: 'Self',      deadline: 'Ongoing',  status: 'Active', notes: '', subtasks: [], progress: 0 },
]

export function useGoals() {
  const [goals,   setGoals]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) {
      if ((data || []).length === 0) {
        await seedDefaultGoals()
      } else {
        setGoals(data.map(toUI))
      }
    }
    setLoading(false)
  }

  const seedDefaultGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const rows = DEFAULT_GOALS.map((g) => ({ ...g, user_id: user.id }))
    const { data } = await supabase.from('goals').insert(rows).select()
    if (data) setGoals(data.map(toUI))
  }

  /* ── Core CRUD ── */
  const addGoal = async (goal) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id:  user.id,
        name:     goal.title    || goal.name || '',   // accept both
        category: goal.category ?? '',
        deadline: goal.target   || goal.deadline || '',
        status:   'Active',
        progress: 0,
        subtasks: [],
        notes:    goal.notes    ?? '',
      })
      .select()
      .single()
    if (!error) setGoals((prev) => [...prev, toUI(data)])
  }

  const updateGoal = async (id, updates) => {
    const dbUpdates = toDBUpdates(updates)
    if (!Object.keys(dbUpdates).length) return
    const { data, error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setGoals((prev) => prev.map((g) => g.id === id ? toUI(data) : g))
  }

  const deleteGoal = async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  /* ── Subtask helpers — update the goal row's JSONB subtasks array ── */
  const addSubtask = async (goalId, text, subtaskId = null, linkedTaskId = null) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const newSt = {
      id:        subtaskId || `st${Date.now()}`,
      title:     text,
      completed: false,
      ...(linkedTaskId ? { linkedTaskId } : {}),
    }
    const subtasks = [...(goal.subtasks || []), newSt]
    await updateGoal(goalId, { subtasks, progress: calcProgress(subtasks) })
  }

  const toggleSubtask = async (goalId, subtaskId) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const subtasks = goal.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    await updateGoal(goalId, { subtasks, progress: calcProgress(subtasks) })
  }

  const deleteSubtask = async (goalId, subtaskId) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    const subtasks = goal.subtasks.filter((st) => st.id !== subtaskId)
    await updateGoal(goalId, { subtasks, progress: calcProgress(subtasks) })
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, addSubtask, toggleSubtask, deleteSubtask, refetch: fetchGoals }
}
