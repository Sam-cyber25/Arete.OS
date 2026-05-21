import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence }   from 'framer-motion'
import { format, isSameDay }         from 'date-fns'
import { useApp }                    from '../context/AppContext'
import { usePlanner }                from '../hooks/usePlanner'
import { useIsMobile }               from '../hooks/useIsMobile'
import { CAT_COLORS, CAT_LABELS }    from '../hooks/useSchedule'
import OrnamentalDivider             from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const INT_CATS = ['study', 'work', 'mma', 'gym', 'growth', 'pers', 'other']
const PRIORITIES = ['high', 'mid', 'low']

const PRIORITY_COLORS = {
  high: 'var(--gold)',
  mid:  'var(--bronze)',
  low:  'transparent',
}

// ── Day-badge helper ─────────────────────────────────────────
function getDayBadge(dayOfWeek) {
  // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (dayOfWeek === 0) return { label: 'ACTIVE REST DAY', color: 'var(--success)' }
  if (dayOfWeek === 2 || dayOfWeek === 5) return { label: 'FRENCH + TUTOR DAY', color: 'var(--gold)' }
  return null
}

// ── Debounced textarea ───────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, style }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)
  useEffect(() => { setLocal(value) }, [value])
  const handle = (e) => {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(e.target.value), 400)
  }
  return (
    <textarea
      value={local}
      onChange={handle}
      placeholder={placeholder}
      className="textarea-journal"
      style={{ ...style, fontSize: '15px', lineHeight: 1.75 }}
      rows={2}
    />
  )
}

// ── Fixed Routine Block ──────────────────────────────────────
function RoutineBlock({ event }) {
  const color = CAT_COLORS[event.category] || CAT_COLORS.other
  const label = CAT_LABELS[event.category] || '[—]'
  const start = new Date(event.startTime)

  return (
    <div
      className="flex items-start gap-3 py-2"
      style={{ borderBottom: '1px solid var(--divider)' }}
    >
      <div style={{ width: 2, height: '100%', minHeight: 36, background: color, flexShrink: 0, borderRadius: 1 }} />
      <div className="flex-1 min-w-0">
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', display: 'block', marginBottom: 1 }}>
          {format(start, 'h:mm a')}
        </span>
        <span className="font-cinzel" style={{ fontSize: '8px', color, letterSpacing: '0.1em', display: 'block', marginBottom: 2 }}>
          {label}
        </span>
        <span className="font-garamond" style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.3 }}>
          {event.title}
        </span>
      </div>
    </div>
  )
}

// ── Intention Row ────────────────────────────────────────────
function IntentionRow({ intention, onUpdate, onDelete }) {
  const borderColor = PRIORITY_COLORS[intention.priority] || 'transparent'
  const catColor    = CAT_COLORS[intention.category] || CAT_COLORS.other
  const catLabel    = CAT_LABELS[intention.category] || '[—]'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group relative"
      style={{
        borderLeft:  `2px solid ${borderColor}`,
        paddingLeft: 12,
        paddingTop:   8,
        paddingBottom: 8,
        borderBottom: '1px solid var(--divider)',
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', flexShrink: 0 }}>
          {intention.time}
        </span>
        <span className="font-cinzel" style={{ fontSize: '8px', color: catColor, letterSpacing: '0.1em', flexShrink: 0 }}>
          {catLabel}
        </span>
        <span className="font-cinzel uppercase" style={{
          fontSize: '8px',
          letterSpacing: '0.1em',
          color: intention.priority === 'high' ? 'var(--gold)' : intention.priority === 'mid' ? 'var(--bronze)' : 'var(--faint)',
        }}>
          {intention.priority}
        </span>
      </div>

      <p className="font-garamond" style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.3 }}>
        {intention.task}
      </p>

      {intention.note && (
        <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 2 }}>
          {intention.note}
        </p>
      )}

      {/* Hover delete */}
      <button
        onClick={() => onDelete(intention.id)}
        className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity font-cinzel"
        style={{ fontSize: '10px', color: 'var(--muted)', padding: '2px 6px' }}
      >
        ×
      </button>
    </motion.div>
  )
}

// ── Add Intention Form ───────────────────────────────────────
function AddIntentionForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    time: '09:00', task: '', category: 'work', priority: 'mid', note: '',
  })

  const handle = (e) => {
    if (!form.task.trim()) return
    onAdd(form)
    setForm({ time: '09:00', task: '', category: 'work', priority: 'mid', note: '' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        overflow:   'hidden',
        background: 'var(--surface)',
        border:     '1px solid var(--border)',
        borderTop:  '1px solid rgba(201,168,76,0.3)',
        padding:    20,
        marginTop:  12,
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Time + Task row */}
        <div className="flex gap-3 items-end">
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            className="font-mono input-box"
            style={{ width: 100, fontSize: '13px', padding: '8px 10px' }}
          />
          <input
            value={form.task}
            onChange={(e) => setForm((p) => ({ ...p, task: e.target.value }))}
            placeholder="Intention..."
            className="input-underline font-garamond flex-1"
            style={{ fontSize: '16px' }}
            onKeyDown={(e) => e.key === 'Enter' && handle()}
            autoFocus
          />
        </div>

        {/* Category row */}
        <div className="flex gap-2 flex-wrap">
          {INT_CATS.map((c) => (
            <button
              key={c}
              onClick={() => setForm((p) => ({ ...p, category: c }))}
              className="font-cinzel uppercase"
              style={{
                fontSize:    '8px',
                letterSpacing: '0.12em',
                padding:     '4px 10px',
                border:      '1px solid var(--border)',
                borderColor: form.category === c ? 'var(--gold)' : 'var(--border)',
                color:       form.category === c ? 'var(--bg)' : 'var(--muted)',
                background:  form.category === c ? 'var(--gold)' : 'transparent',
                minHeight:   'unset',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Priority row */}
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
              className="font-cinzel uppercase"
              style={{
                fontSize:    '8px',
                letterSpacing: '0.12em',
                padding:     '4px 12px',
                border:      '1px solid var(--border)',
                borderColor: form.priority === p ? 'var(--gold)' : 'var(--border)',
                color:       form.priority === p ? 'var(--bg)' : 'var(--muted)',
                background:  form.priority === p ? 'var(--gold)' : 'transparent',
                minHeight:   'unset',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Optional note */}
        <input
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
          placeholder="Optional note..."
          className="input-underline font-garamond"
          style={{ fontSize: '14px' }}
        />

        {/* Buttons */}
        <div className="flex gap-3 justify-end" style={{ marginTop: 4 }}>
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ fontSize: '9px', padding: '8px 20px' }} onClick={handle}>
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Merged timeline (Full Picture) ───────────────────────────
function FullPicture({ fixedBlocks, intentions }) {
  const all = [
    ...fixedBlocks.map((ev) => ({
      time:  format(new Date(ev.startTime), 'HH:mm'),
      label: ev.title,
      type:  'fixed',
      cat:   ev.category,
    })),
    ...intentions.map((i) => ({
      time:  i.time,
      label: i.task,
      type:  'intention',
      cat:   i.category,
      priority: i.priority,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time))

  if (!all.length) {
    return (
      <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '14px' }}>
        No blocks yet. Add intentions above.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {all.map((item, idx) => {
        const color = CAT_COLORS[item.cat] || CAT_COLORS.other
        return (
          <div
            key={idx}
            className="flex items-start gap-3 py-2"
            style={{ borderBottom: '1px solid var(--divider)' }}
          >
            <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', color: 'var(--faint)', width: 46 }}>
              {item.time}
            </span>
            <div style={{ width: 2, minHeight: 20, background: color, flexShrink: 0, borderRadius: 1, opacity: item.type === 'fixed' ? 0.6 : 1 }} />
            <span className="font-garamond" style={{ fontSize: '14px', color: item.type === 'fixed' ? 'var(--muted)' : 'var(--text)' }}>
              {item.label}
            </span>
            {item.type === 'intention' && item.priority === 'high' && (
              <span className="font-mono" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--gold)' }}>◆</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Past Plans accordion ─────────────────────────────────────
function PastPlansSection({ getPastPlans }) {
  const [plans]     = useState(() => getPastPlans())
  const [openIdx, setOpenIdx] = useState(null)

  if (!plans.length) return (
    <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '14px' }}>
      No past plans recorded yet.
    </p>
  )

  return (
    <div>
      {plans.map(({ date, plan }, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid var(--divider)' }}>
          <button
            className="flex items-center justify-between w-full py-3 text-left"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            style={{ minHeight: 44 }}
          >
            <span className="font-cormorant" style={{ fontSize: '16px', color: 'var(--text)' }}>
              {format(date, 'EEEE, d MMM')}
            </span>
            {plan.objective && (
              <span className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {plan.objective}
              </span>
            )}
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', marginLeft: 8 }}>
              {openIdx === idx ? '−' : '+'}
            </span>
          </button>

          <AnimatePresence>
            {openIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden', paddingBottom: 12 }}
              >
                {plan.objective && (
                  <p className="font-garamond" style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: 6 }}>
                    <span className="section-label" style={{ display: 'inline', marginRight: 8 }}>Objective:</span>
                    {plan.objective}
                  </p>
                )}
                {(plan.intentions || []).slice(0, 6).map((i, ii) => (
                  <p key={ii} className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: 2 }}>
                    {i.time} · {i.task}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function PlannerPage() {
  const { events, tasks }    = useApp()
  const {
    tomorrow, plan,
    addIntention, updateIntention, deleteIntention,
    updateReflection, carryTask, getPastPlans,
  } = usePlanner()
  const isMobile = useIsMobile()

  const [showAddForm,   setShowAddForm]   = useState(false)
  const [showCarry,     setShowCarry]     = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [mobileTab,     setMobileTab]     = useState('intentions')

  const tomorrowDay = tomorrow.getDay()    // 0=Sun, 1=Mon, ..., 6=Sat
  const dayBadge    = getDayBadge(tomorrowDay)

  /* Fixed routine: recurring events for tomorrow's day-of-week */
  const fixedRoutine = useMemo(() => {
    return events
      .filter((ev) => ev.recurring === 'weekly' && new Date(ev.startTime).getDay() === tomorrowDay)
      .sort((a, b) => {
        const aT = new Date(a.startTime)
        const bT = new Date(b.startTime)
        return (aT.getHours() * 60 + aT.getMinutes()) - (bT.getHours() * 60 + bT.getMinutes())
      })
  }, [events, tomorrowDay])

  /* Intentions sorted by time, then priority */
  const sortedIntentions = useMemo(() => {
    return [...(plan.intentions || [])].sort((a, b) => {
      if (a.time !== b.time) return a.time.localeCompare(b.time)
      const p = { high: 0, mid: 1, low: 2 }
      return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
    })
  }, [plan.intentions])

  const incompleteTasks = tasks.filter((t) => !t.completed)

  const handleCarrySelected = () => {
    selectedTasks.forEach((task) => carryTask(task))
    setShowCarry(false)
    setSelectedTasks([])
  }

  const toggleTaskSelect = (task) => {
    setSelectedTasks((prev) =>
      prev.find((t) => t.id === task.id)
        ? prev.filter((t) => t.id !== task.id)
        : [...prev, task]
    )
  }

  /* Mobile tab labels */
  const MOBILE_TABS = [
    { id: 'foundation', label: 'Foundation' },
    { id: 'intentions', label: 'Intentions' },
    { id: 'full',       label: 'Full View'  },
  ]

  return (
    <motion.div {...PAGE} className="flex flex-col" style={{ height: '100%' }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.28em', marginBottom: 4 }}>
          Tomorrow
        </p>
        <div className="flex items-baseline gap-4 flex-wrap">
          <p className="font-cormorant italic" style={{ fontSize: '26px', color: 'var(--text)', fontWeight: 500, lineHeight: 1.1 }}>
            {format(tomorrow, 'EEEE, d MMMM')}
          </p>
          {dayBadge && (
            <span
              className="font-cinzel uppercase"
              style={{ fontSize: '8px', letterSpacing: '0.18em', color: dayBadge.color, border: `1px solid ${dayBadge.color}`, padding: '3px 8px' }}
            >
              {dayBadge.label}
            </span>
          )}
        </div>
      </div>

      <OrnamentalDivider opacity={0.12} />

      {/* ── Mobile Tabs ─────────────────────────────────────── */}
      {isMobile && (
        <div className="priority-tabs flex-shrink-0">
          {MOBILE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id)}
              className="priority-tab"
              style={{
                color:           mobileTab === t.id ? 'var(--gold)' : 'var(--faint)',
                borderBottomColor: mobileTab === t.id ? 'var(--gold)' : 'transparent',
                minHeight:       44,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Two-column body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap:      0,
            minHeight: '100%',
          }}
        >
          {/* ── LEFT: Fixed Routine ─────────────────────────── */}
          {(!isMobile || mobileTab === 'foundation') && (
            <div
              style={{
                borderRight: isMobile ? 'none' : '1px solid var(--border)',
                padding:     '20px 24px',
              }}
            >
              <p className="section-label" style={{ marginBottom: 16 }}>Fixed Routine</p>

              {fixedRoutine.length === 0 ? (
                <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '14px' }}>
                  No recurring events for this day.
                </p>
              ) : (
                fixedRoutine.map((ev) => (
                  <RoutineBlock key={ev.id} event={ev} />
                ))
              )}
            </div>
          )}

          {/* ── RIGHT: Intentions ───────────────────────────── */}
          {(!isMobile || mobileTab === 'intentions') && (
            <div style={{ padding: '20px 24px' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Tomorrow's Intentions</p>
                <span className="font-mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {(plan.intentions || []).length} added
                </span>
              </div>

              {/* Intentions list */}
              <AnimatePresence mode="popLayout">
                {sortedIntentions.map((i) => (
                  <IntentionRow
                    key={i.id}
                    intention={i}
                    onUpdate={updateIntention}
                    onDelete={deleteIntention}
                  />
                ))}
              </AnimatePresence>

              {/* Add form */}
              <AnimatePresence>
                {showAddForm && (
                  <AddIntentionForm
                    onAdd={(data) => { addIntention(data); setShowAddForm(false) }}
                    onCancel={() => setShowAddForm(false)}
                  />
                )}
              </AnimatePresence>

              {!showAddForm && (
                <button
                  className="font-cinzel uppercase"
                  style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.2em', marginTop: 16, display: 'block', minHeight: 44 }}
                  onClick={() => setShowAddForm(true)}
                >
                  + Add Intention
                </button>
              )}

              {/* Carry forward */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
                <button
                  className="font-cinzel uppercase"
                  style={{ fontSize: '8px', color: 'var(--gold)', letterSpacing: '0.18em', minHeight: 44 }}
                  onClick={() => setShowCarry((p) => !p)}
                >
                  {showCarry ? '↑ Hide' : '↓ Carry from today?'}
                </button>

                <AnimatePresence>
                  {showCarry && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden', marginTop: 12 }}
                    >
                      {incompleteTasks.length === 0 ? (
                        <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '14px' }}>
                          No incomplete tasks.
                        </p>
                      ) : (
                        <>
                          {incompleteTasks.map((task) => {
                            const selected = !!selectedTasks.find((t) => t.id === task.id)
                            return (
                              <button
                                key={task.id}
                                onClick={() => toggleTaskSelect(task)}
                                className="flex items-center gap-3 w-full text-left py-2"
                                style={{ borderBottom: '1px solid var(--divider)', minHeight: 44 }}
                              >
                                <div style={{
                                  width: 14, height: 14, border: `1px solid ${selected ? 'var(--gold)' : 'var(--faint)'}`,
                                  background: selected ? 'rgba(201,168,76,0.2)' : 'transparent', flexShrink: 0,
                                }} />
                                <span className="font-garamond" style={{ fontSize: '15px', color: 'var(--text)' }}>
                                  {task.title}
                                </span>
                              </button>
                            )
                          })}
                          {selectedTasks.length > 0 && (
                            <button
                              className="btn-primary"
                              style={{ marginTop: 12, fontSize: '9px', padding: '8px 20px' }}
                              onClick={handleCarrySelected}
                            >
                              Carry {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''}
                            </button>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* ── Full Picture (merged timeline) ─────────────────── */}
        {(!isMobile || mobileTab === 'full') && (
          <div
            style={{
              borderTop:   '1px solid var(--border)',
              padding:     '20px 24px',
            }}
          >
            <p className="section-label" style={{ marginBottom: 16 }}>Full Picture</p>
            <FullPicture fixedBlocks={fixedRoutine} intentions={sortedIntentions} />
          </div>
        )}

        {/* ── Reflection Prompts ─────────────────────────────── */}
        {(!isMobile || mobileTab === 'intentions') && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding:   '20px 24px',
            }}
          >
            <p className="section-label" style={{ marginBottom: 20 }}>Reflection</p>
            <div className="flex flex-col gap-6">
              {[
                { field: 'objective',      label: "Tomorrow's Main Objective",  ph: 'What must be accomplished above all else...' },
                { field: 'obstacles',      label: 'Potential Obstacles',        ph: 'What might stand in the way...' },
                { field: 'nonNegotiables', label: 'Non-Negotiables',            ph: 'What MUST happen no matter what...' },
              ].map(({ field, label, ph }) => (
                <div key={field}>
                  <p className="section-label" style={{ marginBottom: 8 }}>{label}</p>
                  <AutoTextarea
                    value={plan[field] || ''}
                    onChange={(v) => updateReflection(field, v)}
                    placeholder={ph}
                    style={{}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Past Plans ─────────────────────────────────────── */}
        {!isMobile && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding:   '20px 24px',
            }}
          >
            <p className="section-label" style={{ marginBottom: 16 }}>Past Plans</p>
            <PastPlansSection getPastPlans={getPastPlans} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
