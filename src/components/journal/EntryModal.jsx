import { useState, useEffect } from 'react'
import { useApp }              from '../../context/AppContext'
import { formatRomanDate }     from '../../utils/dateHelpers'
import Modal                   from '../ui/Modal'

const INTENSITY_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

const SECTIONS = [
  { key: 'victories',  label: 'Victories'  },
  { key: 'lessons',    label: 'Lessons'    },
  { key: 'tomorrow',   label: 'Tomorrow'   },
  { key: 'reflection', label: 'Reflection' },
]

export default function EntryModal({ entry, onClose }) {
  const { deleteEntry, showToast } = useApp()

  /*
   * Keep a stable snapshot of the entry so the content stays visible
   * during the Modal's exit animation (when entry becomes null).
   */
  const [snap, setSnap] = useState(entry)
  useEffect(() => { if (entry) setSnap(entry) }, [entry])

  const handleDelete = () => {
    deleteEntry(snap.date)
    showToast('Entry removed', 'error')
    onClose()
  }

  return (
    <Modal isOpen={!!entry} onClose={onClose}>
      {snap && (
        <>
          {/* Header */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p
                className="font-cinzel uppercase tracking-widest"
                style={{ fontSize: '13px', color: 'var(--gold)', letterSpacing: '0.3em' }}
              >
                {formatRomanDate(new Date(snap.date + 'T12:00:00'))}
              </p>
              {snap.intensity && (
                <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.15em', marginTop: 4 }}>
                  Intensity — {INTENSITY_LABELS[snap.intensity]}
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
              snap[key] ? (
                <div key={key}>
                  <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
                  <p
                    className="font-garamond"
                    style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                  >
                    {snap[key]}
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
        </>
      )}
    </Modal>
  )
}
