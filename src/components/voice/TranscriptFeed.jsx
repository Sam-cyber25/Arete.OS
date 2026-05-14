import { AnimatePresence, motion } from 'framer-motion'
import { format }                  from 'date-fns'

export default function TranscriptFeed({ exchanges }) {
  if (exchanges.length === 0) {
    return (
      <p className="font-garamond italic" style={{ color: 'var(--faint)', fontSize: '14px' }}>
        Awaiting command...
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-h-56 overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {exchanges.map((ex) => (
          <motion.div
            key={ex.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* User input */}
            <div className="flex items-baseline gap-3 mb-1">
              <span
                className="font-mono flex-shrink-0"
                style={{ fontSize: '9px', color: 'var(--faint)' }}
              >
                {format(ex.timestamp, 'HH:mm:ss')}
              </span>
              <p className="font-garamond" style={{ color: 'var(--text)', fontSize: '15px' }}>
                {ex.input}
              </p>
            </div>
            {/* Response */}
            {ex.response && (
              <p
                className="font-garamond italic"
                style={{ color: 'var(--muted)', fontSize: '14px', paddingLeft: 60 }}
              >
                {ex.response}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
