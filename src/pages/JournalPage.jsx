import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence }                   from 'framer-motion'
import { useJournal }                                from '../hooks/useJournal'
import { useIsMobile }                               from '../hooks/useIsMobile'

/* ── Stable today string (module-level so it never changes within a session) ── */
const today = new Date().toISOString().slice(0, 10)

const INTENSITY_OPTIONS = [
  { value: 1, label: 'I',   desc: 'Quiet'   },
  { value: 2, label: 'II',  desc: 'Steady'  },
  { value: 3, label: 'III', desc: 'Focused' },
  { value: 4, label: 'IV',  desc: 'Intense' },
  { value: 5, label: 'V',   desc: 'Maximum' },
]

const PROMPTS = [
  { key: 'victories',  label: 'VICTORIES',  icon: '⚔',  placeholder: 'What did you conquer today? Every advance, no matter how small.' },
  { key: 'lessons',    label: 'LESSONS',    icon: '📖', placeholder: 'What did today teach you? What would you do differently?' },
  { key: 'tomorrow',   label: 'TOMORROW',   icon: '🎯', placeholder: 'What three things must be done tomorrow, without fail?' },
  { key: 'reflection', label: 'REFLECTION', icon: '🔮', placeholder: 'Speak freely. This space is yours alone.' },
]

const EMPTY = { intensity: 3, victories: '', lessons: '', tomorrow: '', reflection: '' }

/* ── Shared text style helpers ── */
const cinzel   = { fontFamily: 'Cinzel, serif' }
const garamond = { fontFamily: 'Cormorant Garamond, serif' }
const ebGara   = { fontFamily: 'EB Garamond, serif' }
const mono     = { fontFamily: 'JetBrains Mono, monospace' }

export default function JournalPage() {
  const { entries, loading, saveEntry, deleteEntry, journalStreak } = useJournal()
  const isMobile = useIsMobile()

  const [view,          setView]          = useState('write')   // 'write' | 'history'
  const [form,          setForm]          = useState(EMPTY)
  const [status,        setStatus]        = useState('idle')    // idle | saving | saved | error
  const [expandedEntry, setExpandedEntry] = useState(null)
  const [activeSection, setActiveSection] = useState('victories')

  const hasTyped   = useRef(false)
  const saveTimer  = useRef(null)

  /* ── Load today's entry once Supabase data arrives, but only if the user
        hasn't started typing yet (avoid clobbering unsaved work) ── */
  useEffect(() => {
    if (loading || hasTyped.current) return
    const existing = entries.find((e) => e.entry_date === today)
    if (existing) {
      setForm({
        intensity:  existing.intensity  ?? 3,
        victories:  existing.victories  ?? '',
        lessons:    existing.lessons    ?? '',
        tomorrow:   existing.tomorrow   ?? '',
        reflection: existing.reflection ?? '',
      })
    }
  }, [entries, loading])

  /* ── Save to Supabase ── */
  const doSave = useCallback(async () => {
    setStatus('saving')
    try {
      const success = await saveEntry({ date: today, ...form })
      if (success) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [form, saveEntry])

  /* ── Update form field + schedule auto-save ── */
  const handleChange = (key, value) => {
    hasTyped.current = true
    setForm((p) => ({ ...p, [key]: value }))
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(doSave, 3000)
  }

  const handleManualSave = async () => {
    clearTimeout(saveTimer.current)
    await doSave()
  }

  const handleDelete = async (entryDate) => {
    await deleteEntry(entryDate)
    setExpandedEntry(null)
  }

  /* ── Derived data ── */
  const past = entries
    .filter((e) => e.entry_date !== today)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))

  const todayWordCount = Object.values(form)
    .filter((v) => typeof v === 'string')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ ...cinzel, fontSize: '11px', letterSpacing: '0.3em', color: 'var(--faint)' }}>
          — loading —
        </p>
      </div>
    )
  }

  /* ────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="page-container"
      style={{ maxWidth: 780, margin: '0 auto' }}
    >

      {/* ══════════════ TOP BAR ══════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ ...cinzel, fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            Acta Diurna
          </p>
          <h1 style={{ ...garamond, fontSize: isMobile ? '26px' : '32px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
            Field Journal
          </h1>
        </div>

        {/* Streak */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ ...mono, fontSize: isMobile ? '22px' : '28px', color: 'var(--gold)', lineHeight: 1 }}>
            {journalStreak}
          </p>
          <p style={{ ...cinzel, fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>
            Day Streak
          </p>
        </div>
      </div>

      {/* ══════════════ VIEW TOGGLE ══════════════ */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: '1px solid var(--divider)' }}>
        {[
          { id: 'write',   label: 'Write Today'          },
          { id: 'history', label: `History (${past.length})` },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              ...cinzel,
              fontSize:      '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         view === v.id ? 'var(--gold)' : 'var(--faint)',
              paddingBottom: 12,
              paddingRight:  32,
              background:    'transparent',
              border:        'none',
              borderBottom:  view === v.id ? '1px solid var(--gold)' : '1px solid transparent',
              cursor:        'pointer',
              marginBottom:  -1,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════
            WRITE VIEW
        ══════════════════════════════════════ */}
        {view === 'write' && (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Date · word count · save controls */}
            <div style={{
              display:        'flex',
              alignItems:     isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection:  isMobile ? 'column' : 'row',
              gap:            isMobile ? 16 : 0,
              marginBottom:   32,
            }}>
              <div>
                <p style={{ ...cinzel, fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ ...mono, fontSize: '10px', color: 'var(--faint)', marginTop: 4 }}>
                  {todayWordCount} words
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Save status indicator */}
                <p style={{
                  ...cinzel,
                  fontSize:      '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:   status === 'saved' ? 'var(--gold)' : status === 'error' ? '#8B3A3A' : 'var(--faint)',
                  opacity: status === 'idle' ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}>
                  {status === 'saving' ? '— saving —' : status === 'saved' ? '— committed —' : status === 'error' ? '— failed —' : ''}
                </p>

                {/* Manual save button */}
                <button
                  onClick={handleManualSave}
                  disabled={status === 'saving'}
                  style={{
                    ...cinzel,
                    fontSize:      '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color:      'var(--gold)',
                    background: 'transparent',
                    border:     '1px solid var(--gold)',
                    padding:    '8px 20px',
                    cursor:     status === 'saving' ? 'not-allowed' : 'pointer',
                    opacity:    status === 'saving' ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {status === 'saving' ? 'Saving…' : 'Commit'}
                </button>
              </div>
            </div>

            {/* ── INTENSITY SELECTOR ── */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ ...cinzel, fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
                Day Intensity
              </p>

              {/* Desktop: 5 equal columns. Mobile: 2-column grid (wraps naturally) */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                gap:                 8,
              }}>
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange('intensity', opt.value)}
                    style={{
                      padding:     '12px 8px',
                      background:  form.intensity === opt.value ? 'var(--gold)' : 'transparent',
                      border:      '1px solid',
                      borderColor: form.intensity === opt.value ? 'var(--gold)' : 'var(--border)',
                      cursor:      'pointer',
                      transition:  'all 0.2s',
                    }}
                  >
                    <p style={{ ...cinzel, fontSize: '13px', color: form.intensity === opt.value ? '#0C0A08' : 'var(--muted)', marginBottom: 4 }}>
                      {opt.label}
                    </p>
                    <p style={{ ...ebGara, fontSize: '11px', color: form.intensity === opt.value ? '#0C0A08' : 'var(--faint)' }}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION NAVIGATOR ── */}
            <div style={{
              display:      'flex',
              flexWrap:     'wrap',
              gap:          0,
              marginBottom: 32,
              borderBottom: '1px solid var(--divider)',
            }}>
              {PROMPTS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActiveSection(p.key)}
                  style={{
                    ...cinzel,
                    fontSize:      '9px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color:         activeSection === p.key ? 'var(--text)' : 'var(--faint)',
                    paddingBottom: 10,
                    paddingRight:  isMobile ? 16 : 24,
                    background:    'transparent',
                    border:        'none',
                    borderBottom:  activeSection === p.key ? '1px solid var(--text)' : '1px solid transparent',
                    cursor:        'pointer',
                    marginBottom:  -1,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ── ACTIVE SECTION TEXTAREA ── */}
            <AnimatePresence mode="wait">
              {PROMPTS.map((p) => activeSection === p.key && (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Prompt / placeholder description */}
                  <p style={{ ...garamond, fontSize: '14px', fontStyle: 'italic', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    {p.placeholder}
                  </p>

                  {/* Main writing area */}
                  <textarea
                    value={form[p.key]}
                    onChange={(e) => handleChange(p.key, e.target.value)}
                    placeholder=""
                    style={{
                      ...ebGara,
                      width:        '100%',
                      minHeight:    p.key === 'reflection' ? 240 : 180,
                      background:   'transparent',
                      border:       'none',
                      borderBottom: '1px solid var(--divider)',
                      outline:      'none',
                      fontSize:     isMobile ? '17px' : '18px',
                      color:        'var(--text)',
                      lineHeight:   1.8,
                      resize:       'none',
                      padding:      '16px 0',
                      display:      'block',
                    }}
                    onFocus={(e)  => { e.target.style.borderBottomColor = 'var(--gold)' }}
                    onBlur={(e)   => { e.target.style.borderBottomColor = 'var(--divider)' }}
                  />

                  {/* ── Section navigation arrows ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                    {PROMPTS.indexOf(p) > 0 ? (
                      <button
                        onClick={() => setActiveSection(PROMPTS[PROMPTS.indexOf(p) - 1].key)}
                        style={{ ...cinzel, fontSize: '9px', letterSpacing: '0.15em', color: 'var(--faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        ← {PROMPTS[PROMPTS.indexOf(p) - 1].label}
                      </button>
                    ) : (
                      <div />
                    )}

                    {PROMPTS.indexOf(p) < PROMPTS.length - 1 ? (
                      <button
                        onClick={() => setActiveSection(PROMPTS[PROMPTS.indexOf(p) + 1].key)}
                        style={{ ...cinzel, fontSize: '9px', letterSpacing: '0.15em', color: 'var(--gold)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        {PROMPTS[PROMPTS.indexOf(p) + 1].label} →
                      </button>
                    ) : (
                      /* Last section — show COMMIT ENTRY instead of forward arrow */
                      <button
                        onClick={handleManualSave}
                        style={{ ...cinzel, fontSize: '9px', letterSpacing: '0.15em', color: 'var(--gold)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        COMMIT ENTRY →
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

          </motion.div>
        )}

        {/* ══════════════════════════════════════
            HISTORY VIEW
        ══════════════════════════════════════ */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {past.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <p style={{ ...garamond, fontSize: '20px', fontStyle: 'italic', color: 'var(--faint)' }}>
                  No past entries yet.
                </p>
                <p style={{ ...ebGara, fontSize: '14px', color: 'var(--faint)', marginTop: 8 }}>
                  Your record begins today.
                </p>
              </div>
            ) : (
              <div>
                {past.map((entry, i) => (
                  <motion.div
                    key={entry.entry_date}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    style={{ borderBottom: '1px solid var(--divider)', padding: '24px 0', cursor: 'pointer' }}
                    onClick={() => setExpandedEntry(expandedEntry === entry.entry_date ? null : entry.entry_date)}
                  >
                    {/* ── Entry row header ── */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Date + intensity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                          <p style={{ ...cinzel, fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            {new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                          {entry.intensity && (
                            <span style={{ ...cinzel, fontSize: '9px', color: 'var(--bronze)', letterSpacing: '0.1em' }}>
                              {'I'.repeat(entry.intensity)}
                            </span>
                          )}
                        </div>

                        {/* Victories preview */}
                        {entry.victories && (
                          <p style={{
                            ...ebGara,
                            fontSize:          '15px',
                            color:             'var(--muted)',
                            lineHeight:        1.6,
                            overflow:          'hidden',
                            display:           '-webkit-box',
                            WebkitLineClamp:   2,
                            WebkitBoxOrient:   'vertical',
                          }}>
                            {entry.victories}
                          </p>
                        )}
                      </div>

                      {/* READ / CLOSE + delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ ...cinzel, fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.1em' }}>
                          {expandedEntry === entry.entry_date ? 'CLOSE' : 'READ'}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.entry_date) }}
                          title="Delete entry"
                          style={{
                            ...cinzel,
                            fontSize:   '14px',
                            color:      'var(--faint)',
                            background: 'transparent',
                            border:     'none',
                            cursor:     'pointer',
                            lineHeight: 1,
                            padding:    '0 2px',
                            transition: 'color 150ms',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#8B3A3A' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--faint)' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded full entry ── */}
                    <AnimatePresence>
                      {expandedEntry === entry.entry_date && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: 'hidden', marginTop: 24 }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 16, borderTop: '1px solid var(--divider)' }}>
                            {[
                              { key: 'victories',  label: 'VICTORIES'  },
                              { key: 'lessons',    label: 'LESSONS'    },
                              { key: 'tomorrow',   label: 'TOMORROW'   },
                              { key: 'reflection', label: 'REFLECTION' },
                            ].map((s) =>
                              entry[s.key] ? (
                                <div key={s.key}>
                                  <p style={{ ...cinzel, fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
                                    {s.label}
                                  </p>
                                  <p style={{ ...ebGara, fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {entry[s.key]}
                                  </p>
                                </div>
                              ) : null
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
