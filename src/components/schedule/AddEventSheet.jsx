import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format }                  from 'date-fns'
import { CAT_COLORS, CATEGORIES }  from './scheduleConstants'
import { useIsMobile }             from '../../hooks/useIsMobile'

/* ── Duration presets ── */
const PRESETS = [
  { id: '30m',    label: '30m',  minutes: 30  },
  { id: '1h',     label: '1h',   minutes: 60  },
  { id: '1.5h',   label: '1.5h', minutes: 90  },
  { id: '2h',     label: '2h',   minutes: 120 },
  { id: '3h',     label: '3h',   minutes: 180 },
  { id: 'custom', label: 'CUSTOM',minutes: null },
]

function fmt12(h, m) {
  const h12 = h % 12 || 12
  const ap   = h < 12 ? 'AM' : 'PM'
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

/* ── Time stepper ── */
function Stepper({ value, min, max, step = 1, onChange, padTo = 2 }) {
  const inc = () => onChange(value + step > max ? min : value + step)
  const dec = () => onChange(value - step < min ? max : value - step)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button
        type="button"
        onClick={inc}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '2px 6px' }}
      >
        ▲
      </button>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', color: 'var(--text)', minWidth: 42, textAlign: 'center', lineHeight: 1 }}>
        {String(value).padStart(padTo, '0')}
      </span>
      <button
        type="button"
        onClick={dec}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '2px 6px' }}
      >
        ▼
      </button>
    </div>
  )
}

/* ── Toggle group ── */
function ToggleRow({ options, value, onChange, getColor }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((opt) => {
        const active = value === opt.id
        const color  = getColor ? getColor(opt.id) : 'var(--gold)'
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="font-cinzel uppercase"
            style={{
              fontSize:      '9px',
              letterSpacing: '0.14em',
              padding:       '5px 12px',
              border:        `1px solid ${active ? color : 'var(--border)'}`,
              background:    active ? `${color}20` : 'transparent',
              color:         active ? color : 'var(--faint)',
              cursor:        'pointer',
              transition:    'all 0.14s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────
   ADD / EDIT FORM CONTENT
───────────────────────────────────────── */
function FormContent({ editingEvent, defaultTime, selectedDate, onSave, onDelete, onClose }) {
  const isMobile = useIsMobile()

  /* ── Form state ── */
  const [title,       setTitle]       = useState('')
  const [note,        setNote]        = useState('')
  const [startHour,   setStartHour]   = useState(8)
  const [startMinute, setStartMinute] = useState(0)
  const [durPreset,   setDurPreset]   = useState('1h')
  const [customDurH,  setCustomDurH]  = useState(1)
  const [customDurM,  setCustomDurM]  = useState(0)
  const [category,    setCategory]    = useState('work')
  const [recurring,   setRecurring]   = useState('once')

  /* ── Populate on edit / default time ── */
  useEffect(() => {
    if (editingEvent) {
      const d   = new Date(editingEvent.startTime)
      const dur = editingEvent.duration || 60
      setTitle(editingEvent.title   || '')
      setNote(editingEvent.note     || '')
      setStartHour(d.getHours())
      setStartMinute(d.getMinutes())
      const match = PRESETS.find((p) => p.minutes === dur)
      if (match && match.id !== 'custom') {
        setDurPreset(match.id)
      } else {
        setDurPreset('custom')
        setCustomDurH(Math.floor(dur / 60))
        setCustomDurM(dur % 60)
      }
      setCategory(editingEvent.category || 'work')
      setRecurring(editingEvent.recurring || 'once')
    } else {
      setTitle('')
      setNote('')
      setStartHour(defaultTime?.hour   ?? 8)
      setStartMinute(defaultTime?.minute ?? 0)
      setDurPreset('1h')
      setCustomDurH(1)
      setCustomDurM(0)
      setCategory('work')
      setRecurring('once')
    }
  }, [editingEvent, defaultTime])

  /* ── Computed values ── */
  const effectiveDur = durPreset === 'custom'
    ? Math.max(15, customDurH * 60 + customDurM)
    : (PRESETS.find((p) => p.id === durPreset)?.minutes ?? 60)

  const endTotalMin  = startHour * 60 + startMinute + effectiveDur
  const endH         = Math.floor(endTotalMin / 60) % 24
  const endM         = endTotalMin % 60
  const endsAtStr    = fmt12(endH, endM)

  /* ── Save ── */
  const handleSave = () => {
    if (!title.trim()) return
    const startISO = new Date(
      `${selectedDate}T${String(startHour).padStart(2,'0')}:${String(startMinute).padStart(2,'0')}:00`
    ).toISOString()
    onSave({
      title:     title.trim(),
      note:      note.trim(),
      startTime: startISO,
      duration:  effectiveDur,
      category,
      recurring,
    })
  }

  const formattedDate = format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')

  return (
    <div>
      {/* Drag handle (mobile) */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-2">
          <div style={{ width: 40, height: 3, background: '#4A3F32', borderRadius: 99 }} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: isMobile ? '12px 24px 0' : '0 0 16px', marginBottom: isMobile ? 16 : 0 }}>
        <p className="font-cinzel uppercase" style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.26em' }}>
          {editingEvent ? 'Edit Event' : 'Add Event'}
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
      </div>

      <div style={{ padding: isMobile ? '0 24px 40px' : '0', overflowY: 'auto', flex: 1 }}>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <input
            autoFocus
            type="text"
            placeholder="What must be done…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width:       '100%',
              background:  'transparent',
              border:      'none',
              borderBottom:'1px solid var(--border)',
              color:       'var(--text)',
              fontFamily:  'Cormorant Garamond, serif',
              fontSize:    '22px',
              padding:     '6px 0',
              outline:     'none',
              transition:  'border-color 0.15s',
            }}
            onFocus={(e)  => (e.target.style.borderBottomColor = 'var(--gold)')}
            onBlur={(e)   => (e.target.style.borderBottomColor = 'var(--border)')}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 8 }}>Note</p>
          <textarea
            rows={3}
            placeholder="Details, focus points, intentions…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width:      '100%',
              background: 'var(--surface)',
              border:     '1px solid var(--border)',
              color:      'var(--text)',
              fontFamily: 'EB Garamond, serif',
              fontSize:   '14px',
              padding:    '8px 12px',
              resize:     'none',
              outline:    'none',
              lineHeight: 1.55,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Date */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 6 }}>Date</p>
          <p className="font-garamond" style={{ fontSize: '15px', color: 'var(--muted)' }}>{formattedDate}</p>
        </div>

        {/* Start time */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 12 }}>Start Time</p>
          <div className="flex items-center gap-3">
            <Stepper value={startHour}   min={0} max={23} onChange={setStartHour} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', color: 'var(--faint)' }}>:</span>
            <Stepper value={startMinute} min={0} max={55} step={5} onChange={setStartMinute} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--muted)', marginLeft: 4 }}>
              {startHour < 12 ? 'AM' : 'PM'}
            </span>
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 10 }}>Duration</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {PRESETS.map((p) => {
              const active = durPreset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDurPreset(p.id)}
                  className="font-cinzel uppercase"
                  style={{
                    fontSize:      '9px',
                    letterSpacing: '0.12em',
                    padding:       '5px 12px',
                    border:        `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    background:    active ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color:         active ? 'var(--gold)' : 'var(--faint)',
                    cursor:        'pointer',
                    transition:    'all 0.14s',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Custom duration inputs */}
          {durPreset === 'custom' && (
            <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={customDurH}
                  onChange={(e) => setCustomDurH(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                  style={{ width: 48, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'JetBrains Mono', fontSize: '15px', padding: '4px 8px', outline: 'none', textAlign: 'center' }}
                />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--faint)' }}>h</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={customDurM}
                  onChange={(e) => setCustomDurM(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  style={{ width: 48, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'JetBrains Mono', fontSize: '15px', padding: '4px 8px', outline: 'none', textAlign: 'center' }}
                />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--faint)' }}>m</span>
              </div>
            </div>
          )}

          {/* Ends at preview */}
          <p className="font-mono" style={{ fontSize: '10px', color: 'rgba(201,168,76,0.6)' }}>
            Ends at {endsAtStr}
          </p>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 10 }}>Category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat
              const color  = CAT_COLORS[cat] || '#4A3F32'
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="font-cinzel uppercase"
                  style={{
                    fontSize:      '9px',
                    letterSpacing: '0.12em',
                    padding:       '5px 12px',
                    border:        `1px solid ${active ? color : 'var(--border)'}`,
                    background:    active ? `${color}20` : 'transparent',
                    color:         active ? color : 'var(--faint)',
                    cursor:        'pointer',
                    transition:    'all 0.14s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recurring */}
        <div style={{ marginBottom: 28 }}>
          <p className="font-cinzel uppercase" style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.22em', marginBottom: 10 }}>Recurring</p>
          <ToggleRow
            options={[
              { id: 'once',   label: 'ONCE'   },
              { id: 'daily',  label: 'DAILY'  },
              { id: 'weekly', label: 'WEEKLY' },
            ]}
            value={recurring}
            onChange={setRecurring}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              width:         '100%',
              padding:       '13px',
              background:    title.trim() ? 'rgba(201,168,76,0.12)' : 'transparent',
              border:        `1px solid ${title.trim() ? 'rgba(201,168,76,0.6)' : 'var(--border)'}`,
              color:         title.trim() ? 'var(--gold)' : 'var(--faint)',
              fontFamily:    'Cinzel, serif',
              fontSize:      '10px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              cursor:        title.trim() ? 'pointer' : 'not-allowed',
              transition:    'all 0.15s',
            }}
          >
            {editingEvent ? 'Update Event' : 'Save Event'}
          </button>

          {editingEvent && (
            <button
              type="button"
              onClick={() => onDelete(editingEvent.id)}
              style={{
                width:         '100%',
                padding:       '10px',
                background:    'transparent',
                border:        'none',
                color:         '#8B3A3A',
                fontFamily:    'Cinzel, serif',
                fontSize:      '9px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor:        'pointer',
                opacity:       0.7,
              }}
            >
              Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SHEET / MODAL WRAPPER
───────────────────────────────────────── */
export default function AddEventSheet({ open, onClose, editingEvent, defaultTime, selectedDate, onSave, onDelete }) {
  const isMobile = useIsMobile()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(12,10,8,0.8)' }}
            onClick={onClose}
          />

          {/* Panel */}
          {isMobile ? (
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position:   'fixed',
                left:       0,
                bottom:     0,
                width:      '100vw',
                zIndex:     1001,
                background: '#13110E',
                borderTop:  '1px solid rgba(201,168,76,0.4)',
                maxHeight:  '85vh',
                overflowY:  'auto',
                display:    'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormContent
                editingEvent={editingEvent}
                defaultTime={defaultTime}
                selectedDate={selectedDate}
                onSave={onSave}
                onDelete={onDelete}
                onClose={onClose}
              />
            </motion.div>
          ) : (
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position:   'fixed',
                top:        '50%',
                left:       '50%',
                transform:  'translate(-50%, -50%)',
                zIndex:     1001,
                background: '#13110E',
                border:     '1px solid rgba(201,168,76,0.25)',
                width:      520,
                maxWidth:   'calc(100vw - 40px)',
                maxHeight:  '85vh',
                overflowY:  'auto',
                padding:    '28px 32px 36px',
                display:    'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormContent
                editingEvent={editingEvent}
                defaultTime={defaultTime}
                selectedDate={selectedDate}
                onSave={onSave}
                onDelete={onDelete}
                onClose={onClose}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
