import { motion }         from 'framer-motion'
import { useApp }         from '../../context/AppContext'
import { useTimeTheme }   from '../../hooks/useTimeTheme'
import { useIsMobile }    from '../../hooks/useIsMobile'

export default function GreetingHero() {
  const { settings }  = useApp()
  const theme         = useTimeTheme()
  const isMobile      = useIsMobile()
  const name          = settings?.userName || 'Sam'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="card card-gold-top"
      style={{ textAlign: 'center', padding: isMobile ? '28px 24px' : '40px 48px' }}
    >
      {/* Time-of-day badge */}
      <p
        className="font-cinzel uppercase"
        style={{
          fontSize:      '8px',
          color:         'var(--bronze)',
          letterSpacing: '0.28em',
          marginBottom:  16,
          opacity:       0.8,
        }}
      >
        {theme.name}
      </p>

      {/* Large headline */}
      <p
        className="font-cormorant italic"
        style={{
          fontSize:   isMobile ? '36px' : '48px',
          color:      'var(--text)',
          lineHeight: 1.15,
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        {theme.headline}
      </p>

      {/* Greeting + name */}
      <p
        className="font-cinzel uppercase"
        style={{
          fontSize:      '10px',
          color:         'var(--muted)',
          letterSpacing: '0.22em',
        }}
      >
        {theme.greeting}, {name}.
      </p>
    </motion.div>
  )
}
