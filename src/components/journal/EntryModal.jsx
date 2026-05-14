import { motion, AnimatePresence } from 'framer-motion'
import { useApp }                   from '../../context/AppContext'
import { formatRomanDate }          from '../../utils/dateHelpers'

const INTENSITY_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

const SECTIONS = [
  { key: 'victories',  label: 'Victories'  },
  { key: 'lessons',    label: 'Lessons'    },
  { key: 'tomorrow',   label: 'Tomorrow'   },
  { key: 'reflection', label: 'Reflection' },
]

export default function EntryModal({ entry, onClose }) {
  const { deleteEntry, showToast } = useApp()

  if (!entry) return null

  const handleDelete = () => {
    deleteEntry(entry.date)
    showToast('Entry removed', 'error')
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="entry-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(12,10,8,0.88)' }}
        onClick={onClose}
      >
        <motion.div
          key="entry-modal-content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
          style={{
            background:  'var(--surface)',
            border:      '1px solid var(--border)',
            borderTop:   '1px solid rgba(201,168,76,0.4)',
            padding:     40,
            maxHeight:   '85vh',
            overflowY:   'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p
                className="font-cinzel uppercase tracking-widest"
                style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em' }}
              >
                {formatRomanDate(new Date(entry.date + 'T12:00:00'))}
              </p>
              {entry.intensity && (
                <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.15em', marginTop: 4 }}>
                  Intensity — {INTENSITY_LABELS[entry.intensity]}
                </p>
              )}
            </div>
            <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={onClose}>
              Close
            </button>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {SECTIONS.map(({ key, label }) =>
              entry[key] ? (
                <div key={key}>
                  <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
                  <p
                    className="font-garamond"
                    style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                  >
                    {entry[key]}
                  </p>
                </div>
              ) : null
            )}
          </div>

          {/* Delete */}
          <div
            className="flex justify-end"
            style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--divider)' }}
          >
            <button className="btn-danger" onClick={handleDelete}>
              Delete Entry
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
