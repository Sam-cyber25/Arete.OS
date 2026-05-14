import { motion }         from 'framer-motion'
import { useApp }         from '../../context/AppContext'
import { formatTimestamp } from '../../utils/dateHelpers'

export default function MemoryPreview() {
  const { notes, setCurrentPage } = useApp()
  const recent = notes.slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
      className="card flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <p className="section-label">Recent Memory</p>
        <button
          className="btn-ghost"
          style={{ fontSize: '9px', letterSpacing: '0.18em' }}
          onClick={() => setCurrentPage('memory')}
        >
          All Notes
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {recent.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.07 }}
          >
            {note.title && (
              <p
                className="font-cormorant"
                style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600, marginBottom: 3 }}
              >
                {note.title}
              </p>
            )}
            <p
              className="font-garamond line-clamp-2"
              style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}
            >
              {note.content}
            </p>
            <p
              className="font-mono"
              style={{ color: 'var(--faint)', fontSize: '10px', marginTop: 4 }}
            >
              {formatTimestamp(note.createdAt)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
