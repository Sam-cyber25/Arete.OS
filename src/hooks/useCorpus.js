import { useLocalStorage } from './useLocalStorage'
import { format, subDays } from 'date-fns'

export const PROTEIN_GOAL = 120

/* ── Version-keyed seed: 7 days of realistic sample data ── */
const CORPUS_SEED_KEY = 'arete_corpus_seeded_v1'
if (!localStorage.getItem(CORPUS_SEED_KEY)) {
  const today = new Date()
  const WEIGHTS  = [68.2, 68.5, 68.3, 68.8, 68.6, 69.0, 68.7]
  const PROTEINS = [95, 112, 88, 130, 105, 78, 122]
  const FEELS    = [3, 4, 2, 4, 3, 2, 4]
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd')
    const key  = `arete_corpus_${date}`
    if (!localStorage.getItem(key)) {
      const idx = 6 - i
      localStorage.setItem(key, JSON.stringify({
        weight:  WEIGHTS[idx],
        protein: PROTEINS[idx],
        feel:    FEELS[idx],
        gymDone: PROTEINS[idx] >= 100,
        notes:   '',
      }))
    }
  }
  localStorage.setItem(CORPUS_SEED_KEY, '1')
}

const TODAY_KEY = format(new Date(), 'yyyy-MM-dd')
const EMPTY_DAY = { weight: null, protein: 0, feel: null, gymDone: false, notes: '' }

export function useCorpus() {
  /* Today's entry — stored as arete_corpus_YYYY-MM-DD */
  const [todayEntry, setTodayEntry] = useLocalStorage(`corpus_${TODAY_KEY}`, EMPTY_DAY)

  const updateToday = (updates) =>
    setTodayEntry((prev) => ({ ...prev, ...updates }))

  const addProtein = (grams) =>
    setTodayEntry((prev) => ({ ...prev, protein: Math.max(0, (prev.protein || 0) + grams) }))

  /* Read N days of raw localStorage data (not reactive, call inside useMemo) */
  const getLastNDays = (n = 30) => {
    const result = []
    for (let i = n - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const raw  = localStorage.getItem(`arete_corpus_${date}`)
      result.push({
        date,
        label: format(subDays(new Date(), i), 'MMM d'),
        ...(raw ? JSON.parse(raw) : { ...EMPTY_DAY }),
      })
    }
    return result
  }

  /* Derived stats */
  const computeStats = () => {
    const days      = getLastNDays(30)
    const last7     = days.slice(-7).filter((d) => d.protein > 0)
    const withW     = days.filter((d) => d.weight !== null)
    const hitGoal   = days.filter((d) => d.protein >= PROTEIN_GOAL)

    /* Longest streak */
    let maxStreak = 0, cur = 0
    for (const d of days) {
      if (d.protein >= PROTEIN_GOAL) { cur++; maxStreak = Math.max(maxStreak, cur) }
      else cur = 0
    }

    return {
      currentWeight:  withW.length ? withW[withW.length - 1].weight : null,
      avgProtein7d:   last7.length ? Math.round(last7.reduce((s, d) => s + d.protein, 0) / last7.length) : 0,
      daysHitGoal:    hitGoal.length,
      consistencyPct: Math.round((hitGoal.length / days.length) * 100),
      longestStreak:  maxStreak,
    }
  }

  return {
    todayEntry,
    updateToday,
    addProtein,
    getLastNDays,
    computeStats,
    PROTEIN_GOAL,
  }
}
