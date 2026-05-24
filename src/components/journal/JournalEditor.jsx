import { useState, useEffect, useCallback } from 'react'
import { motion }                            from 'framer-motion'
import { useApp }                            from '../../context/AppContext'
import { formatRomanDate }                   from '../../utils/dateHelpers'

const INTENSITY_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

const SECTION_META = [
  { key: 'victories',  label: 'Victories',  placeholder: 'What did you conquer today? Every advance, no matter how small...' },
  { key: 'lessons',    label: 'Lessons',    placeholder: 'What did today teach you? What would you do differently...' },
  { key: 'tomorrow',   label: 'Tomorrow',   placeholder: 'What three things must be done tomorrow, without fail...' },
  { key: 'reflection', label: 'Reflection', placeholder: 'Speak freely. This space is yours alone...' },
]

export default function JournalEditor() {
  const { entries, upsertEntry } = useApp()
  const today    = new Date().toISOString().slice(0, 10)
  const existing = entries.find((e) => e.date === today)

  const [form, setForm] = useState({
    intensity:  existing?.intensity  ?? 3,
    victories:  existing?.victories  ?? '',
    lessons:    existing?.lessons    ?? '',
    tomorrow:   existing?.tomorrow   ?? '',
    reflection: existing?.reflection ?? '',
  })
  const [saved, setSaved] = useState(false)

  const doSave = useCallback(() => {
    upsertEntry({ date: today, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [form, today, upsertEntry])

  // Auto-save after 1.4 s of inactivity
  useEffect(() => {
    const t = setTimeout(doSave, 1400)
    return () => clearTimeout(t)
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      {/* Roman date header */}
      <div className="flex items-baseline justify-between mb-8">
        <p
          className="font-cinzel uppercase tracking-widest"
          style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em' }}
        >
          {formatRomanDate(new Date())}
        </p>

        {/* Saved indicator */}
        <motion.p
          key={saved ? 'visible' : 'hidden'}
          initial={{ opacity: 0 }}
          animate={{ opacity: saved ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="font-mono italic"
          style={{ fontSize: '10px', color: 'var(--faint)' }}
        >
          — saved —
        </motion.p>
      </div>

      {/* Intensity selector */}
      <div className="mb-10">
        <p className="section-label" style={{ marginBottom: 12 }}>Intensity of Day</p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm((p) => ({ ...p, intensity: v }))}
              className="font-cinzel transition-colors"
              style={{
                fontSize:      '12px',
                letterSpacing: '0.15em',
                padding:       '6px 16px',
                border:        '1px solid var(--border)',
                color:         form.intensity === v ? 'var(--bg)' : 'var(--muted)',
                background:    form.intensity === v ? 'var(--gold)' : 'transparent',
                borderColor:   form.intensity === v ? 'var(--gold)' : 'var(--border)',
              }}
            >
              {INTENSITY_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10">
        {SECTION_META.map(({ key, label, placeholder }) => (
          <div key={key}>
            <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
            <textarea
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className="textarea-journal"
              rows={key === 'reflection' ? 6 : 4}
            />
          </div>
        ))}
      </div>

      {/* Manual save */}
      <div className="flex justify-end mt-8">
        <button className="btn-primary" onClick={doSave}>
          Commit Entry
        </button>
      </div>
    </div>
  )
}
