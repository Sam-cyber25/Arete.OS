import { useState }               from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import { format }                   from 'date-fns'

const CATEGORIES = ['study', 'gym', 'work', 'mma', 'personal', 'other']
const DURATIONS  = [
  { label: '30 min',  value: 30  },
  { label: '1 hour',  value: 60  },
  { label: '2 hours', value: 120 },
  { label: 'Custom',  value: 0   },
]

export default function AddEventModal({ open, onClose, defaultDate }) {
  const { addEvent, showToast } = useApp()
  const [form, setForm] = useState({
    title:          '',
    category:       'personal',
    duration:       60,
    customDuration: '',
    recurring:      'none',
    startTime:      defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.startTime) return
    const dur = form.duration === 0 ? Number(form.customDuration) || 60 : form.duration
    addEvent({
      title:     form.title,
      category:  form.category,
      startTime: new Date(form.startTime).toISOString(),
      duration:  dur,
      recurring: form.recurring,
    })
    showToast('Event added to schedule')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(12,10,8,0.85)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
            style={{
              background: 'var(--surface)',
              border:     '1px solid var(--border)',
              borderTop:  '1px solid rgba(201,168,76,0.4)',
              padding:    36,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <p
                className="font-cinzel uppercase tracking-widest"
                style={{ color: 'var(--text)', fontSize: '12px', letterSpacing: '0.22em' }}
              >
                New Event
              </p>
              <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onClose}>
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Title */}
              <div>
                <p className="section-label" style={{ marginBottom: 8 }}>Title</p>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Name this appointment..."
                  className="input-underline font-cormorant"
                  style={{ fontSize: '20px' }}
                  autoFocus
                />
              </div>

              {/* Start time */}
              <div>
                <p className="section-label" style={{ marginBottom: 8 }}>Start Time</p>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  className="input-box font-mono"
                  style={{ fontSize: '13px', colorScheme: 'dark' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <p className="section-label" style={{ marginBottom: 8 }}>Category</p>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="input-box font-garamond capitalize"
                    style={{ fontSize: '15px' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} style={{ textTransform: 'capitalize' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <p className="section-label" style={{ marginBottom: 8 }}>Duration</p>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                    className="input-box font-garamond"
                    style={{ fontSize: '15px' }}
                  >
                    {DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  {form.duration === 0 && (
                    <input
                      type="number"
                      value={form.customDuration}
                      onChange={(e) => setForm((p) => ({ ...p, customDuration: e.target.value }))}
                      placeholder="Minutes..."
                      className="input-underline font-mono"
                      style={{ fontSize: '14px', marginTop: 10 }}
                    />
                  )}
                </div>
              </div>

              {/* Recurring */}
              <div>
                <p className="section-label" style={{ marginBottom: 8 }}>Recurring</p>
                <div className="flex gap-3">
                  {['none', 'daily', 'weekly'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, recurring: r }))}
                      className="font-cinzel capitalize transition-colors"
                      style={{
                        fontSize:      '10px',
                        letterSpacing: '0.12em',
                        padding:       '5px 14px',
                        border:        '1px solid var(--border)',
                        color:         form.recurring === r ? 'var(--bg)' : 'var(--muted)',
                        background:    form.recurring === r ? 'var(--gold)' : 'transparent',
                        borderColor:   form.recurring === r ? 'var(--gold)' : 'var(--border)',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add to Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
