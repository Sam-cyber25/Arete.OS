import { useState, useEffect, useCallback } from 'react'
import { supabase }                          from '../lib/supabase'
import { addDays, subDays, format }          from 'date-fns'

const tomorrow    = addDays(new Date(), 1)
const TOMORROW_KEY = format(tomorrow, 'yyyy-MM-dd')

const DEFAULT_PLAN = {
  intentions:     [],
  objective:      '',
  obstacles:      '',
  nonNegotiables: '',
}

function toUI(row) {
  return {
    date:           row.plan_date,
    intentions:     row.intentions       ?? [],
    objective:      row.main_objective   ?? '',   // DB: main_objective → UI: objective
    obstacles:      row.obstacles        ?? '',
    nonNegotiables: row.non_negotiables  ?? '',
  }
}

export function usePlanner() {
  const [plansCache, setPlansCache] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    setLoading(true)
    const since = format(subDays(new Date(), 9), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('planner_entries')
      .select('*')
      .gte('plan_date', since)
      .order('plan_date', { ascending: false })
    if (!error) setPlansCache((data || []).map(toUI))
    setLoading(false)
  }

  /* Tomorrow's plan (or empty default) */
  const plan = plansCache.find((p) => p.date === TOMORROW_KEY) || { ...DEFAULT_PLAN, date: TOMORROW_KEY }

  /* ── Persist a full plan snapshot ── */
  const savePlan = useCallback(async (updatedPlan) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('planner_entries')
      .upsert(
        {
          user_id:         user.id,
          plan_date:       TOMORROW_KEY,
          intentions:      updatedPlan.intentions     ?? [],
          main_objective:  updatedPlan.objective      ?? '',   // DB: main_objective
          obstacles:       updatedPlan.obstacles      ?? '',
          non_negotiables: updatedPlan.nonNegotiables ?? '',
        },
        { onConflict: 'user_id,plan_date' }
      )
      .select()
      .single()
    if (!error && data) {
      const ui = toUI(data)
      setPlansCache((prev) => {
        const idx = prev.findIndex((p) => p.date === TOMORROW_KEY)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = ui
          return updated
        }
        return [ui, ...prev]
      })
    }
  }, [])

  const addIntention = useCallback(async (intention) => {
    const intentions = [...(plan.intentions || []), { id: `int_${Date.now()}`, ...intention }]
    await savePlan({ ...plan, intentions })
  }, [plan, savePlan])

  const updateIntention = useCallback(async (id, updates) => {
    const intentions = (plan.intentions || []).map((i) => i.id === id ? { ...i, ...updates } : i)
    await savePlan({ ...plan, intentions })
  }, [plan, savePlan])

  const deleteIntention = useCallback(async (id) => {
    const intentions = (plan.intentions || []).filter((i) => i.id !== id)
    await savePlan({ ...plan, intentions })
  }, [plan, savePlan])

  const updateReflection = useCallback(async (field, value) => {
    await savePlan({ ...plan, [field]: value })
  }, [plan, savePlan])

  const carryTask = useCallback(async (task) => {
    const intention = {
      id:       `int_${Date.now()}`,
      time:     '09:00',
      task:     task.title,
      category: 'work',
      priority: task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'mid' : 'low',
      note:     '',
    }
    const intentions = [...(plan.intentions || []), intention]
    await savePlan({ ...plan, intentions })
  }, [plan, savePlan])

  /* ── Past plans from in-memory cache ── */
  const getPastPlans = useCallback(() =>
    plansCache
      .filter((p) => p.date !== TOMORROW_KEY)
      .map((p) => ({ date: new Date(p.date + 'T00:00:00'), plan: p })),
  [plansCache])

  return {
    tomorrow,
    plan,
    loading,
    addIntention,
    updateIntention,
    deleteIntention,
    updateReflection,
    carryTask,
    getPastPlans,
    refetch: fetchPlans,
  }
}
