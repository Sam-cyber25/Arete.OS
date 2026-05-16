import { useState, useMemo }          from 'react'
import { motion, AnimatePresence }    from 'framer-motion'
import { useApp }                     from '../context/AppContext'
import { useIsMobile }                from '../hooks/useIsMobile'
import OrnamentalDivider              from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

/* ── Category colours ── */
const CAT_COLORS = {
  SPIRITUAL:  '#C9A84C',
  BODY:       '#4A6741',
  MIND:       '#5C7A8A',
  COMBAT:     '#8B3A3A',
  ACADEMIC:   '#7A6A8A',
  WORK:       '#C9A84C',
  DISCIPLINE: '#8A7A65',
}
const CAT_LIST = Object.keys(CAT_COLORS)

/* ── Roman numeral helper ── */
function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let r = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i] }
  }
  return r
}
function dateRoman(d) {
  return `${toRoman(d.getDate())} · ${toRoman(d.getMonth()+1)} · ${toRoman(d.getFullYear())}`
}

/* ── Circular progress ring ── */
const RING_R = 54
const RING_C = 2 * Math.PI * RING_R

function ProgressRing({ completed, total }) {
  const pct    = total > 0 ? completed / total : 0
  const offset = RING_C * (1 - pct)
  return (
    <div style={{ position: 'relative', width: 148, height: 148 }}>
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={RING_R} fill="none" stroke="#2A2520" strokeWidth="2" />
        <motion.circle
          cx="74" cy="74" r={RING_R}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '74px 74px' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="font-cormorant" style={{ fontSize: '36px', color: 'var(--text)', lineHeight: 1 }}>
          {completed}
        </span>
        <span className="font-cinzel" style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.2em', marginTop: 2 }}>
          / {total}
        </span>
      </div>
    </div>
  )
}

/* ── Individual habit card ── */
function HabitCard({ habit, completed, streak, onToggle, onDelete, onEditName }) {
  const [hovering,  setHovering]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [editName,  setEditName]  = useState(habit.name)
  const catColor = CAT_COLORS[habit.category] || '#8A7A65'

  const commitEdit = () => {
    if (editName.trim()) onEditName(editName.trim())
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="card"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        14,
        padding:    '14px 18px',
        borderLeft: completed ? '2px solid var(--gold)' : '2px solid transparent',
        minHeight:  60,
        position:   'relative',
        transition: 'border-left-color 0.2s ease',
      }}
    >
      {/* Toggle circle */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.85 }}
        style={{
          width:        24,
          height:       24,
          minWidth:     24,
          minHeight:    24,
          borderRadius: '50%',
          border:       `1px solid ${completed ? 'var(--gold)' : '#8A7A65'}`,
          background:   completed ? 'rgba(201,168,76,0.15)' : 'transparent',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          flexShrink:   0,
          cursor:       'pointer',
          transition:   'all 0.22s ease',
          padding:      0,
        }}
      >
        <AnimatePresence>
          {completed && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{   scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ fontSize: '10px', color: 'var(--gold)', lineHeight: 1 }}
            >
              ✦
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          className="font-cinzel uppercase"
          style={{ fontSize: '8px', color: catColor, letterSpacing: '0.16em', display: 'block', marginBottom: 3 }}
        >
          {habit.category}
        </span>
        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
            className="input-underline font-garamond"
            style={{ fontSize: '16px', padding: '0', width: '100%' }}
            autoFocus
          />
        ) : (
          <span
            className="font-garamond"
            onClick={() => setEditing(true)}
            style={{
              fontSize:  '16px',
              color:     'var(--text)',
              opacity:   completed ? 0.5 : 1,
              lineHeight: 1.3,
              cursor:    'text',
              display:   'block',
              transition: 'opacity 0.2s',
            }}
          >
            {habit.name}
          </span>
        )}
      </div>

      {/* Streak counter */}
      {streak > 0 && (
        <span
          className="font-mono flex-shrink-0"
          style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.04em' }}
        >
          ↑{streak}
        </span>
      )}

      {/* Delete — hover revealed */}
      {hovering && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="font-mono"
          style={{
            position:  'absolute',
            top:       6,
            right:     10,
            fontSize:  '16px',
            color:     'var(--muted)',
            minHeight: 'unset',
            padding:   0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  )
}

/* ── Add Habit form ── */
function AddHabitForm({ onAdd, onCancel }) {
  const [name,     setName]     = useState('')
  const [category, setCategory] = useState('DISCIPLINE')
  const [target,   setTarget]   = useState('daily')

  const DAY_OPTIONS = [
    { label: 'Mon', val: 'mon' },
    { label: 'Tue', val: 'tue' },
    { label: 'Wed', val: 'wed' },
    { label: 'Thu', val: 'thu' },
    { label: 'Fri', val: 'fri' },
    { label: 'Sat', val: 'sat' },
    { label: 'Sun', val: 'sun' },
  ]

  const [selectedDays, setSelectedDays] = useState([])
  const effectiveTarget = selectedDays.length > 0 ? selectedDays.join(',') : 'daily'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), category, target: effectiveTarget })
    setName('')
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="card"
      style={{ padding: '20px 24px', borderTop: '1px solid rgba(201,168,76,0.3)' }}
    >
      <p className="section-label" style={{ marginBottom: 14 }}>Forge New Discipline</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What must be done daily..."
        className="input-underline font-cormorant"
        style={{ fontSize: '18px', marginBottom: 16 }}
        autoFocus
      />
      <div className="flex gap-4 flex-wrap mb-4">
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-box font-cinzel"
            style={{ fontSize: '11px', letterSpacing: '0.1em', width: 'auto', padding: '8px 12px' }}
          >
            {CAT_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Active Days</p>
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className="font-cinzel uppercase"
              style={{
                fontSize: '8px', letterSpacing: '0.12em', padding: '5px 8px',
                border: `1px solid ${selectedDays.length === 0 ? 'var(--gold)' : 'var(--border)'}`,
                color: selectedDays.length === 0 ? 'var(--gold)' : 'var(--muted)',
                background: 'transparent', cursor: 'pointer',
              }}
            >
              Daily
            </button>
            {DAY_OPTIONS.map(({ label, val }) => {
              const on = selectedDays.includes(val)
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedDays((p) =>
                    p.includes(val) ? p.filter((d) => d !== val) : [...p, val]
                  )}
                  className="font-cinzel uppercase"
                  style={{
                    fontSize: '8px', letterSpacing: '0.12em', padding: '5px 8px',
                    border: `1px solid ${on ? 'var(--gold)' : 'var(--border)'}`,
                    color: on ? 'var(--gold)' : 'var(--muted)',
                    background: 'transparent', cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
          Forge
        </button>
        <button type="button" className="btn-ghost" style={{ fontSize: '9px' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </motion.form>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function DisciplinesPage() {
  const {
    habits, todayCompletions, applicableToday,
    completedTodayCount, isPerfectDay,
    toggleHabit, addHabit, updateHabit, deleteHabit, getHabitStreak,
  } = useApp()

  const isMobile   = useIsMobile()
  const [showForm, setShowForm] = useState(false)

  const today = new Date()

  /* Top-3 by streak */
  const topStreaks = useMemo(() =>
    [...habits]
      .map((h) => ({ ...h, streak: getHabitStreak(h.id) }))
      .filter((h) => h.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3),
  [habits, getHabitStreak])

  /* Group by category for desktop layout */
  const grouped = useMemo(() => {
    const out = {}
    habits.forEach((h) => {
      if (!out[h.category]) out[h.category] = []
      out[h.category].push(h)
    })
    return out
  }, [habits])

  return (
    <motion.div
      {...PAGE}
      className="page-container"
      style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? undefined : '0' }}
    >
      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p
            className="font-cinzel uppercase tracking-widest"
            style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}
          >
            Non-Negotiables
          </p>
          <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
            The Disciplines
          </p>
          <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.2em', marginTop: 4 }}>
            {dateRoman(today)}
          </p>
        </div>

        {/* Circular progress */}
        <div style={{ marginTop: isMobile ? 8 : 0, flexShrink: 0 }}>
          <ProgressRing completed={completedTodayCount} total={applicableToday.length} />
        </div>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── PERFECT DAY badge ── */}
      <AnimatePresence>
        {isPerfectDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 text-center"
          >
            <span
              className="font-cinzel uppercase perfect-day-shimmer"
              style={{
                fontSize: '11px', letterSpacing: '0.28em',
                color: 'var(--gold)', padding: '8px 24px',
                border: '1px solid rgba(201,168,76,0.4)',
                background: 'rgba(201,168,76,0.06)',
              }}
            >
              ✦ Perfect Day ✦
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Habit grid ── */}
      <div
        className={isMobile ? 'flex flex-col gap-2' : 'grid gap-2 mb-8'}
        style={isMobile ? { marginBottom: 24 } : { gridTemplateColumns: '1fr 1fr' }}
      >
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completed={!!todayCompletions[habit.id]}
            streak={getHabitStreak(habit.id)}
            onToggle={() => toggleHabit(habit.id)}
            onDelete={() => deleteHabit(habit.id)}
            onEditName={(name) => updateHabit(habit.id, { name })}
          />
        ))}
      </div>

      <OrnamentalDivider opacity={0.12} />

      {/* ── STREAK COMMAND ── */}
      {topStreaks.length > 0 && (
        <div className="mb-8">
          <p className="section-label" style={{ marginBottom: 16 }}>Streak Command</p>
          <div className="flex flex-col gap-3">
            {topStreaks.map((h, i) => (
              <div key={h.id} className="flex items-center gap-4">
                <span
                  className="font-mono flex-shrink-0"
                  style={{ fontSize: '9px', color: 'var(--faint)', width: 18 }}
                >
                  {i + 1}.
                </span>
                <span className="font-garamond flex-1" style={{ fontSize: '15px', color: 'var(--text)' }}>
                  {h.name}
                </span>
                <span
                  className="font-mono flex-shrink-0"
                  style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.04em' }}
                >
                  ↑{h.streak}
                </span>
              </div>
            ))}
          </div>

          {/* Overall score */}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--divider)' }}>
            <span className="section-label">Today's Score</span>
            <span
              className="font-cormorant"
              style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600 }}
            >
              {applicableToday.length > 0
                ? Math.round((completedTodayCount / applicableToday.length) * 100)
                : 0}%
            </span>
          </div>
        </div>
      )}

      {/* ── Add discipline ── */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <AddHabitForm
            key="form"
            onAdd={(h) => { addHabit(h); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowForm(true)}
            className="btn-primary w-full"
            style={{ padding: '12px', marginBottom: 32 }}
          >
            Forge New Discipline
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
