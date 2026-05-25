import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import { useJournal }                   from '../hooks/useJournal'
import { formatRomanDate }              from '../utils/dateHelpers'

const INTENSITY_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

const EMPTY_FORM = {
  intensity:  3,
  victories:  '',
  lessons:    '',
  tomorrow:   '',
  reflection: '',
}

const SECTIONS = [
  { key: 'victories',  label: 'Victories',  placeholder: 'What did you conquer today? Every advance, no matter how small...' },
  { key: 'lessons',    label: 'Lessons',    placeholder: 'What did today teach you? What would you do differently...' },
  { key: 'tomorrow',   label: 'Tomorrow',   placeholder: 'What three things must be done tomorrow, without fail...' },
  { key: 'reflection', label: 'Reflection', placeholder: 'Speak freely. This space is yours alone...' },
]

export default function JournalPage() {
  const { entries, loading, saveEntry, deleteEntry, getTodayEntry } = useJournal()

  const [tab,           setTab]           = useState('today')
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [savedStatus,   setSavedStatus]   = useState('idle')   // idle | saving | saved | error
  const [selectedEntry, setSelectedEntry] = useState(null)

  const today        = new Date().toISOString().slice(0, 10)
  const formLoaded   = useRef(false)
  const autoSaveTimer = useRef(null)
  const hasUserTyped  = useRef(false)

  /* ── Load today's entry into form once Supabase data arrives ── */
  useEffect(() => {
    if (loading || formLoaded.current) return
    const existing = getTodayEntry()
    if (existing) {
      setForm({
        intensity:  existing.intensity  || 3,
        victories:  existing.victories  || '',
        lessons:    existing.lessons    || '',
        tomorrow:   existing.tomorrow   || '',
        reflection: existing.reflection || '',
      })
    }
    formLoaded.current = true
  }, [entries, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-save — only after user has typed something ── */
  useEffect(() => {
    if (!hasUserTyped.current) return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { handleSave(false) }, 4000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key) => (e) => {
    hasUserTyped.current = true
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleIntensity = (v) => {
    hasUserTyped.current = true
    setForm((prev) => ({ ...prev, intensity: v }))
  }

  const handleSave = async (showFeedback = true) => {
    setSavedStatus('saving')
    const success = await saveEntry({ date: today, ...form })
    if (success) {
      /* Reset so the form can reload from Supabase on the next fetch cycle */
      hasUserTyped.current  = false
      formLoaded.current    = false
      setForm(EMPTY_FORM)
    }
    setSavedStatus(success ? 'saved' : 'error')
    if (showFeedback) setTimeout(() => setSavedStatus('idle'), 2500)
    else              setTimeout(() => setSavedStatus('idle'), 1000)
  }

  const handleDelete = async (entryDate) => {
    await deleteEntry(entryDate)
    setSelectedEntry(null)
  }

  const past = entries
    .filter((e) => e.entry_date !== today)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--faint)' }}>
      — loading —
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="page-container"
      style={{ maxWidth: 760, margin: '0 auto' }}
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="font-cinzel uppercase" style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.22em', marginBottom: 4 }}>
          Acta Diurna
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600 }}>
          Daily Journal
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-6 mb-8" style={{ borderBottom: '1px solid var(--divider)' }}>
        {[{ id: 'today', label: "Today's Entry" }, { id: 'past', label: 'Past Entries' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="font-cinzel uppercase transition-colors"
            style={{
              fontSize:      '10px',
              letterSpacing: '0.2em',
              color:         tab === t.id ? 'var(--gold)' : 'var(--faint)',
              paddingBottom: 12,
              borderBottom:  tab === t.id ? '1px solid var(--gold)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ TODAY TAB ══ */}
        {tab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Date + save status */}
            <div className="flex items-baseline justify-between mb-8">
              <p className="font-cinzel uppercase" style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em' }}>
                {formatRomanDate(new Date())}
              </p>
              <p
                className="font-mono italic"
                style={{
                  fontSize:   '10px',
                  color:      savedStatus === 'error' ? '#8B3A3A' : 'var(--faint)',
                  opacity:    savedStatus === 'idle' ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {savedStatus === 'saving' ? '— saving —' : savedStatus === 'saved' ? '— saved —' : savedStatus === 'error' ? '— error saving —' : ''}
              </p>
            </div>

            {/* Intensity selector */}
            <div className="mb-10">
              <p className="section-label" style={{ marginBottom: 12 }}>Intensity of Day</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleIntensity(v)}
                    className="font-cinzel transition-all"
                    style={{
                      fontSize:      '12px',
                      letterSpacing: '0.15em',
                      padding:       '8px 18px',
                      border:        '1px solid',
                      borderColor:   form.intensity === v ? 'var(--gold)' : 'var(--border)',
                      color:         form.intensity === v ? 'var(--bg)'   : 'var(--muted)',
                      background:    form.intensity === v ? 'var(--gold)' : 'transparent',
                    }}
                  >
                    {INTENSITY_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal sections */}
            <div className="flex flex-col gap-10">
              {SECTIONS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
                  <textarea
                    value={form[key]}
                    onChange={handleChange(key)}
                    placeholder={placeholder}
                    className="textarea-journal"
                    rows={key === 'reflection' ? 6 : 4}
                  />
                </div>
              ))}
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-8">
              <button
                className="btn-primary"
                onClick={() => handleSave(true)}
                disabled={savedStatus === 'saving'}
                style={{ opacity: savedStatus === 'saving' ? 0.6 : 1 }}
              >
                {savedStatus === 'saving' ? 'Saving…' : 'Commit Entry'}
              </button>
            </div>

          </motion.div>
        )}

        {/* ══ PAST ENTRIES TAB ══ */}
        {tab === 'past' && (
          <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {past.length === 0 ? (
              <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '15px' }}>
                No past entries yet. Your record begins today.
              </p>
            ) : (
              <div className="flex flex-col">
                {past.map((entry) => (
                  <div
                    key={entry.entry_date}
                    style={{ borderBottom: '1px solid var(--divider)', padding: '20px 0' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: 6 }}>
                          {formatRomanDate(new Date(entry.entry_date + 'T12:00:00'))}
                          {entry.intensity && (
                            <span style={{ color: 'var(--bronze)', marginLeft: 10 }}>
                              {INTENSITY_LABELS[entry.intensity]}
                            </span>
                          )}
                        </p>
                        {entry.victories && (
                          <p
                            className="font-garamond"
                            style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                          >
                            {entry.victories}
                          </p>
                        )}
                      </div>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '9px', flexShrink: 0 }}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        Read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Full-entry modal ── */}
            {selectedEntry && (
              <div
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setSelectedEntry(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: '#13110E', border: '1px solid var(--border)', padding: 36, width: 560, maxWidth: 'calc(100vw - 40px)', maxHeight: '85vh', overflowY: 'auto', borderRadius: 2 }}
                >
                  {/* Modal header */}
                  <div className="flex items-baseline justify-between mb-8">
                    <div>
                      <p className="font-cinzel uppercase" style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em' }}>
                        {formatRomanDate(new Date(selectedEntry.entry_date + 'T12:00:00'))}
                      </p>
                      {selectedEntry.intensity && (
                        <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.15em', marginTop: 4 }}>
                          Intensity — {INTENSITY_LABELS[selectedEntry.intensity]}
                        </p>
                      )}
                    </div>
                    <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setSelectedEntry(null)}>
                      Close
                    </button>
                  </div>

                  {/* Modal body */}
                  <div className="flex flex-col gap-8">
                    {SECTIONS.map(({ key, label }) =>
                      selectedEntry[key] ? (
                        <div key={key}>
                          <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
                          <p className="font-garamond" style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {selectedEntry[key]}
                          </p>
                        </div>
                      ) : null
                    )}
                  </div>

                  {/* Modal footer */}
                  <div className="flex justify-between items-center" style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--divider)' }}>
                    <button className="btn-danger" onClick={() => handleDelete(selectedEntry.entry_date)}>
                      Delete Entry
                    </button>
                    <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={() => setSelectedEntry(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
