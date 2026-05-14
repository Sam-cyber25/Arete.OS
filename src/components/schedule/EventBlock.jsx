import { memo }    from 'react'
import { motion }  from 'framer-motion'
import { useApp }  from '../../context/AppContext'
import { format }  from 'date-fns'

const CAT_PREFIX = {
  study:    '[STUDY]',
  gym:      '[GYM]',
  work:     '[WORK]',
  mma:      '[MMA]',
  personal: '[PERS]',
  other:    '[—]',
}

const EventBlock = memo(function EventBlock({ event, style }) {
  const { deleteEvent } = useApp()

  const prefix = CAT_PREFIX[event.category] || '[—]'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0 right-0 group overflow-hidden"
      style={{
        ...style,
        borderLeft:      '1px solid var(--gold)',
        paddingLeft:     8,
        paddingTop:      4,
        paddingRight:    4,
        zIndex:          5,
        cursor:          'default',
        background:      'var(--surface)',
      }}
    >
      <p
        className="font-cinzel truncate"
        style={{ fontSize: '8px', color: 'var(--bronze)', letterSpacing: '0.1em', marginBottom: 2 }}
      >
        {prefix}
      </p>
      <p
        className="font-garamond truncate"
        style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.3 }}
      >
        {event.title}
      </p>
      <p
        className="font-mono"
        style={{ fontSize: '9px', color: 'var(--faint)' }}
      >
        {format(new Date(event.startTime), 'h:mm a')}
      </p>

      <button
        onClick={() => deleteEvent(event.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 font-cinzel transition-opacity"
        style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.1em' }}
      >
        ✕
      </button>
    </motion.div>
  )
})

export default EventBlock
