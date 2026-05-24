import { useLocalStorage } from './useLocalStorage'

// ── Version-keyed seed: forces re-seed of default goals on version bump ──
const GOALS_SEED_KEY = 'arete_goals_seeded_v3'
if (!localStorage.getItem(GOALS_SEED_KEY)) {
  localStorage.removeItem('arete_goals')
  localStorage.setItem(GOALS_SEED_KEY, '1')
}

// Progress is always derived from subtasks — never set manually
function calcProgress(subtasks = []) {
  if (!subtasks.length) return 0
  return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
}

const DEFAULT_GOALS = [
  { id: 'g1', title: 'AIR 1 in CBSE Class 10 Boards',           category: 'Academic',  target: 'May 2026', progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
  { id: 'g2', title: 'Generate Independent Freelance Income',     category: 'Business',  target: 'Ongoing',  progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
  { id: 'g3', title: 'Body Recomposition — 120g protein daily',  category: 'Health',    target: 'Ongoing',  progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
  { id: 'g4', title: 'Daily Spiritual Practice',                  category: 'Spiritual', target: 'Ongoing',  progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
  { id: 'g5', title: 'MMA Training — Footwork & Striking',       category: 'Combat',    target: 'Ongoing',  progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
  { id: 'g6', title: 'Project Arête — Character Transformation', category: 'Self',      target: 'Ongoing',  progress: 0, status: 'Active', notes: '', subtasks: [], createdAt: new Date().toISOString() },
]

export function useGoals() {
  const [goals, setGoals] = useLocalStorage('goals', DEFAULT_GOALS)

  const addGoal = (goal) =>
    setGoals((prev) => [
      ...prev,
      { ...goal, id: `g${Date.now()}`, createdAt: new Date().toISOString(), progress: 0, status: 'Active', subtasks: [] },
    ])

  const updateGoal = (id, updates) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))

  const deleteGoal = (id) =>
    setGoals((prev) => prev.filter((g) => g.id !== id))

  const addSubtask = (goalId, text, subtaskId = null, linkedTaskId = null) =>
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const newSt = {
          id:         subtaskId || `st${Date.now()}`,
          title:      text,
          completed:  false,
          ...(linkedTaskId ? { linkedTaskId } : {}),
        }
        const subtasks = [...(g.subtasks || []), newSt]
        return { ...g, subtasks, progress: calcProgress(subtasks) }
      })
    )

  const toggleSubtask = (goalId, subtaskId) =>
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const subtasks = g.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
        return { ...g, subtasks, progress: calcProgress(subtasks) }
      })
    )

  const deleteSubtask = (goalId, subtaskId) =>
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const subtasks = g.subtasks.filter((st) => st.id !== subtaskId)
        return { ...g, subtasks, progress: calcProgress(subtasks) }
      })
    )

  return { goals, addGoal, updateGoal, deleteGoal, addSubtask, toggleSubtask, deleteSubtask }
}
