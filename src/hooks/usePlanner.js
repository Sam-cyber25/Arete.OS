import { useState, useCallback }  from 'react'
import { addDays, subDays, format } from 'date-fns'
import { useLocalStorage }         from './useLocalStorage'

const tomorrow = addDays(new Date(), 1)
const TOMORROW_KEY = `planner_${format(tomorrow, 'yyyy-MM-dd')}`

const DEFAULT_PLAN = {
  intentions:      [],
  objective:       '',
  obstacles:       '',
  nonNegotiables:  '',
}

export function usePlanner() {
  const [plan, setPlan] = useLocalStorage(TOMORROW_KEY, DEFAULT_PLAN)

  const addIntention = useCallback((intention) => {
    setPlan((prev) => ({
      ...prev,
      intentions: [
        ...prev.intentions,
        { id: `int_${Date.now()}`, ...intention },
      ],
    }))
  }, [setPlan])

  const updateIntention = useCallback((id, updates) => {
    setPlan((prev) => ({
      ...prev,
      intentions: prev.intentions.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
  }, [setPlan])

  const deleteIntention = useCallback((id) => {
    setPlan((prev) => ({
      ...prev,
      intentions: prev.intentions.filter((i) => i.id !== id),
    }))
  }, [setPlan])

  const updateReflection = useCallback((field, value) => {
    setPlan((prev) => ({ ...prev, [field]: value }))
  }, [setPlan])

  /* Carry a task from Goals as a new intention */
  const carryTask = useCallback((task) => {
    const intention = {
      id:       `int_${Date.now()}`,
      time:     '09:00',
      task:     task.title,
      category: 'work',
      priority: task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'mid' : 'low',
      note:     '',
    }
    setPlan((prev) => ({
      ...prev,
      intentions: [...prev.intentions, intention],
    }))
  }, [setPlan])

  /* Read past 7 days plans directly from localStorage */
  const getPastPlans = useCallback(() => {
    const plans = []
    for (let i = 1; i <= 7; i++) {
      const date = subDays(tomorrow, i + 1)   // days before tomorrow
      const key  = `arete_planner_${format(date, 'yyyy-MM-dd')}`
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          plans.push({ date, plan: JSON.parse(stored) })
        }
      } catch { /* ignore */ }
    }
    return plans
  }, [])

  return {
    tomorrow,
    plan,
    addIntention,
    updateIntention,
    deleteIntention,
    updateReflection,
    carryTask,
    getPastPlans,
  }
}
