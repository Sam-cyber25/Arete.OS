import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { useCorpus, PROTEIN_GOAL }   from '../hooks/useCorpus'
import { useIsMobile }               from '../hooks/useIsMobile'
import OrnamentalDivider             from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const FEEL_LABELS = ['—', 'I', 'II', 'III', 'IV', 'V']
const FEEL_DESCS  = ['—', 'Depleted', 'Low', 'Moderate', 'Strong', 'Peak']
const QUICK_ADDS  = [10, 20, 30, 40]

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function WeightEditor({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  const start  = () => { setDraft(value !== null ? String(value) : ''); setEditing(true) }
  const commit = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n > 0) onChange(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-baseline gap-2">
        <input
          autoFocus
          type="number"
          step="0.1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            background:   'transparent',
            border:       'none',
            borderBottom: '1px solid var(--gold)',
            color:        'var(--gold)',
            fontSize:     '36px',
            fontFamily:   'JetBrains Mono, monospace',
            width:        110,
            outline:      'none',
            padding:      '0 2px',
          }}
        />
        <span className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.2em' }}>KG</span>
      </div>
    )
  }

  return (
    <button
      onClick={start}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'baseline', gap: 6 }}
    >
      <span className="font-mono" style={{ fontSize: '36px', color: value !== null ? 'var(--gold)' : 'var(--faint)', lineHeight: 1 }}>
        {value !== null ? value.toFixed(1) : '—'}
      </span>
      <span className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.2em' }}>KG</span>
    </button>
  )
}

function FeelSelector({ value, onChange, size = 36 }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? null : v)}
          style={{
            width:      size,
            height:     size,
            border:     `1px solid ${value === v ? 'var(--gold)' : 'var(--border)'}`,
            background: value === v ? 'rgba(201,168,76,0.12)' : 'transparent',
            color:      value === v ? 'var(--gold)' : 'var(--muted)',
            fontFamily: 'Cinzel, serif',
            fontSize:   '10px',
            letterSpacing: '0.08em',
            cursor:     'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {FEEL_LABELS[v]}
        </button>
      ))}
    </div>
  )
}

function ProteinBar({ current, goal }) {
  const pct = Math.min(100, Math.round((current / goal) * 100))
  const hit  = current >= goal
  const bar  = hit ? '#6DBF7E' : 'var(--gold)'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono" style={{ fontSize: '32px', color: bar, lineHeight: 1 }}>
          {current}
        </span>
        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>
          / {goal}g
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: bar, borderRadius: 2 }}
        />
      </div>
      <p className="font-cinzel" style={{ fontSize: '8px', color: hit ? '#6DBF7E' : 'var(--faint)', letterSpacing: '0.16em', marginTop: 5 }}>
        {hit ? '◆ GOAL REACHED' : `${goal - current}g remaining`}
      </p>
    </div>
  )
}

function StatTile({ label, value, unit, borderRight, borderBottom }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-5"
      style={{
        borderRight:  borderRight  ? '1px solid var(--divider)' : 'none',
        borderBottom: borderBottom ? '1px solid var(--divider)' : 'none',
      }}
    >
      <p className="font-mono" style={{ fontSize: '28px', color: 'var(--gold)', lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: '13px', color: 'var(--faint)', marginLeft: 2 }}>{unit}</span>}
      </p>
      <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.18em', marginTop: 6, textAlign: 'center' }}>
        {label}
      </p>
    </div>
  )
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#13110E', border: '1px solid #2A2520', padding: '8px 12px' }}>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--gold)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text)' }}>
        {payload[0].value}{unit}
      </p>
    </div>
  )
}

/* ── Log Today bottom sheet ── */
function LogSheet({ open, onClose, entry, onSave }) {
  const [draft, setDraft] = useState({ ...entry })

  useEffect(() => {
    if (open) setDraft({ ...entry })
  }, [open]) // reset draft to current values each time sheet opens

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  const set = (key, val) => setDraft((p) => ({ ...p, [key]: val }))

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(12,10,8,0.82)' }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 bottom-0 z-50"
            style={{
              background:  '#0F0D0A',
              borderTop:   '1px solid rgba(201,168,76,0.4)',
              maxHeight:   '88vh',
              overflowY:   'auto',
              padding:     '20px 24px 48px',
            }}
          >
            <div className="flex justify-center mb-5">
              <div style={{ width: 40, height: 3, background: '#4A3F32', borderRadius: 99 }} />
            </div>

            <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.26em', marginBottom: 24 }}>
              Log Today
            </p>

            {/* Weight */}
            <div className="mb-6">
              <p className="section-label" style={{ marginBottom: 8 }}>Weight (kg)</p>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 68.5"
                value={draft.weight !== null && draft.weight !== undefined ? draft.weight : ''}
                onChange={(e) => set('weight', e.target.value ? parseFloat(e.target.value) : null)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '10px 14px', width: '100%',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', outline: 'none',
                }}
              />
            </div>

            {/* Protein */}
            <div className="mb-6">
              <p className="section-label" style={{ marginBottom: 8 }}>Protein (g)</p>
              <input
                type="number"
                placeholder="e.g. 125"
                value={draft.protein || ''}
                onChange={(e) => set('protein', e.target.value ? parseInt(e.target.value, 10) : 0)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '10px 14px', width: '100%',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', outline: 'none',
                }}
              />
            </div>

            {/* Feel */}
            <div className="mb-6">
              <p className="section-label" style={{ marginBottom: 10 }}>Feel</p>
              <div className="flex items-center gap-4">
                <FeelSelector value={draft.feel} onChange={(v) => set('feel', v)} size={40} />
                {draft.feel && (
                  <span className="font-garamond italic" style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {FEEL_DESCS[draft.feel]}
                  </span>
                )}
              </div>
            </div>

            {/* Gym */}
            <div className="mb-6">
              <button
                onClick={() => set('gymDone', !draft.gymDone)}
                className="flex items-center gap-3"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{
                  width: 22, height: 22, flexShrink: 0,
                  border: `1px solid ${draft.gymDone ? 'var(--gold)' : 'var(--border)'}`,
                  background: draft.gymDone ? 'var(--gold)' : 'transparent',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {draft.gymDone && <span style={{ fontSize: '11px', color: '#0C0A08' }}>✓</span>}
                </div>
                <span className="font-cinzel uppercase" style={{ fontSize: '10px', letterSpacing: '0.2em', color: draft.gymDone ? 'var(--gold)' : 'var(--muted)' }}>
                  Gym Done
                </span>
              </button>
            </div>

            {/* Notes */}
            <div className="mb-8">
              <p className="section-label" style={{ marginBottom: 8 }}>Notes</p>
              <textarea
                rows={3}
                value={draft.notes || ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Optional notes…"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '10px 14px', width: '100%',
                  fontFamily: 'EB Garamond, serif', fontSize: '15px',
                  resize: 'none', outline: 'none', lineHeight: 1.55,
                }}
              />
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%', padding: '14px',
                background: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.5)',
                color: 'var(--gold)',
                fontFamily: 'Cinzel, serif', fontSize: '10px',
                letterSpacing: '0.26em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              Save
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ══════════════════════════════════════════
   CORPUS PAGE
══════════════════════════════════════════ */
export default function CorpusPage() {
  const isMobile = useIsMobile()
  const { todayEntry, updateToday, addProtein, getLastNDays, computeStats } = useCorpus()
  const [logOpen, setLogOpen] = useState(false)

  /* Chart data — recomputed when today's entry changes */
  const last30     = useMemo(() => getLastNDays(30), [todayEntry]) // eslint-disable-line
  const last14     = useMemo(() => getLastNDays(14), [todayEntry]) // eslint-disable-line
  const stats      = useMemo(() => computeStats(),   [todayEntry]) // eslint-disable-line
  const weightData = last30.filter((d) => d.weight !== null)

  const statTiles = [
    { label: 'Current Weight', value: stats.currentWeight !== null ? stats.currentWeight.toFixed(1) : '—', unit: 'kg' },
    { label: 'Avg Protein 7d', value: stats.avgProtein7d,  unit: 'g'  },
    { label: 'Days Hit Goal',  value: stats.daysHitGoal                },
    { label: 'Longest Streak', value: stats.longestStreak, unit: 'd'  },
  ]

  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}>
          Corpus
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Body Stats
        </p>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── TODAY PANEL ── */}
      <div className="card" style={{ padding: isMobile ? '20px' : '28px 32px', marginBottom: 24 }}>
        <div className="flex justify-between items-center mb-6">
          <p className="section-label">Today</p>
          <button
            onClick={() => setLogOpen(true)}
            className="font-cinzel uppercase"
            style={{
              fontSize: '9px', letterSpacing: '0.22em',
              color: 'var(--gold)', background: 'none',
              border: '1px solid rgba(201,168,76,0.35)',
              padding: '6px 14px', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Log Today
          </button>
        </div>

        <div className={isMobile ? 'flex flex-col gap-7' : 'grid grid-cols-2 gap-10'}>

          {/* Left: Weight + Feel */}
          <div>
            <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginBottom: 10 }}>
              Weight
            </p>
            <div style={{ marginBottom: 24 }}>
              <WeightEditor value={todayEntry.weight} onChange={(v) => updateToday({ weight: v })} />
            </div>

            <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginBottom: 10 }}>
              Energy
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <FeelSelector value={todayEntry.feel} onChange={(v) => updateToday({ feel: v })} />
              {todayEntry.feel && (
                <span className="font-garamond italic" style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {FEEL_DESCS[todayEntry.feel]}
                </span>
              )}
            </div>
          </div>

          {/* Right: Protein progress + Quick-add + Gym */}
          <div>
            <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginBottom: 10 }}>
              Protein
            </p>
            <div style={{ marginBottom: 18 }}>
              <ProteinBar current={todayEntry.protein || 0} goal={PROTEIN_GOAL} />
            </div>

            {/* Quick-add buttons */}
            <div className="flex gap-2 mb-6">
              {QUICK_ADDS.map((g) => (
                <motion.button
                  key={g}
                  whileTap={{ scale: 0.91 }}
                  onClick={() => addProtein(g)}
                  style={{
                    flex:       1,
                    padding:    '12px 0',
                    background: 'rgba(201,168,76,0.07)',
                    border:     '1px solid rgba(201,168,76,0.28)',
                    color:      'var(--gold)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize:   '13px',
                    cursor:     'pointer',
                    transition: 'background 0.14s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.07)')}
                >
                  +{g}
                </motion.button>
              ))}
            </div>

            {/* Gym checkbox */}
            <button
              onClick={() => updateToday({ gymDone: !todayEntry.gymDone })}
              className="flex items-center gap-3"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{
                width: 20, height: 20, flexShrink: 0,
                border:     `1px solid ${todayEntry.gymDone ? 'var(--gold)' : 'var(--border)'}`,
                background: todayEntry.gymDone ? 'var(--gold)' : 'transparent',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {todayEntry.gymDone && (
                  <span style={{ fontSize: '10px', color: '#0C0A08', lineHeight: 1 }}>✓</span>
                )}
              </div>
              <span className="font-cinzel uppercase" style={{
                fontSize: '9px', letterSpacing: '0.2em',
                color: todayEntry.gymDone ? 'var(--gold)' : 'var(--muted)',
                transition: 'color 0.15s',
              }}>
                Gym Done
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div
        className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-0 mb-8`}
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {statTiles.map((tile, i) => (
          <StatTile
            key={tile.label}
            {...tile}
            borderRight={isMobile ? i % 2 === 0 : i < 3}
            borderBottom={isMobile && i < 2}
          />
        ))}
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── CHARTS ── */}
      <div className={`${isMobile ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-6'} mt-6`}>

        {/* Weight line chart */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 24 }}>
          <p className="section-label" style={{ marginBottom: 4 }}>Weight Trend</p>
          <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--faint)', marginBottom: 16 }}>
            Last 30 days (kg)
          </p>
          {weightData.length < 2 ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="font-garamond italic" style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Log weight on 2+ days to see trend
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'Cinzel, serif', fontSize: 8, fill: '#4A3F32', letterSpacing: 1 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fill: '#4A3F32' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip unit="kg" />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#C9A84C"
                  strokeWidth={1}
                  dot={false}
                  activeDot={{ r: 3, fill: '#C9A84C', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Protein bar chart */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 24 }}>
          <p className="section-label" style={{ marginBottom: 4 }}>Protein Log</p>
          <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--faint)', marginBottom: 16 }}>
            Last 14 days — goal {PROTEIN_GOAL}g
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last14} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <XAxis
                dataKey="label"
                tick={{ fontFamily: 'Cinzel, serif', fontSize: 8, fill: '#4A3F32', letterSpacing: 1 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fill: '#4A3F32' }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine
                y={PROTEIN_GOAL}
                stroke="#C9A84C"
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.45}
              />
              <Tooltip content={<ChartTooltip unit="g" />} />
              <Bar dataKey="protein" radius={[1, 1, 0, 0]} maxBarSize={14}>
                {last14.map((entry, i) => (
                  <Cell key={i} fill={entry.protein >= PROTEIN_GOAL ? '#6DBF7E' : 'rgba(201,168,76,0.65)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Consistency score ── */}
      <div
        className="flex items-center justify-between"
        style={{
          border: '1px solid var(--border)', background: 'var(--surface)',
          padding: isMobile ? '20px' : '20px 32px', marginTop: 24,
        }}
      >
        <div>
          <p className="section-label" style={{ marginBottom: 6 }}>30-Day Consistency</p>
          <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Days hitting the {PROTEIN_GOAL}g protein goal
          </p>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.2em', marginTop: 6 }}>
            {stats.daysHitGoal} of 30 days
          </p>
        </div>
        <div className="flex-shrink-0" style={{ marginLeft: 24, textAlign: 'right' }}>
          <span
            className="font-cormorant"
            style={{
              fontSize:   '60px',
              fontWeight: 600,
              lineHeight: 1,
              color:      stats.consistencyPct >= 70 ? '#6DBF7E'
                        : stats.consistencyPct >= 40 ? 'var(--gold)'
                        : 'var(--muted)',
            }}
          >
            {stats.consistencyPct}
          </span>
          <span className="font-cinzel" style={{ fontSize: '14px', color: 'var(--faint)', marginLeft: 2 }}>%</span>
        </div>
      </div>

      {/* Log sheet */}
      <LogSheet
        open={logOpen}
        onClose={() => setLogOpen(false)}
        entry={todayEntry}
        onSave={(draft) => updateToday(draft)}
      />
    </motion.div>
  )
}
