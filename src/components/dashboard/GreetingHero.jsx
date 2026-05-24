import { useState, useEffect } from 'react'
import { motion }               from 'framer-motion'
import { useApp }               from '../../context/AppContext'
import { getTimeMessage }       from '../../utils/timeMessages'
import { useIsMobile }          from '../../hooks/useIsMobile'

export default function GreetingHero() {
  const { settings } = useApp()
  const isMobile     = useIsMobile()
  const name         = settings?.userName || 'Sam'

  const [msg, setMsg] = useState(() => getTimeMessage())

  /* Refresh every 60 s — only swap when the hour actually changes */
  useEffect(() => {
    let lastHour = new Date().getHours()
    const id = setInterval(() => {
      const h = new Date().getHours()
      if (h !== lastHour) {
        lastHour = h
        setMsg(getTimeMessage())
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="card card-gold-top"
      style={{ padding: isMobile ? '28px 24px' : '40px 48px' }}
    >
      {/* Time-period badge */}
      <p
        className="font-cinzel uppercase"
        style={{
          fontSize:      isMobile ? '8px' : '9px',
          color:         'var(--bronze)',
          letterSpacing: '0.3em',
          marginBottom:  14,
        }}
      >
        {msg.period}
      </p>

      {/* Large headline */}
      <p
        className="font-cormorant italic"
        style={{
          fontSize:     isMobile ? '34px' : '42px',
          color:        'var(--text)',
          lineHeight:   1.15,
          fontWeight:   600,
          marginBottom: 12,
        }}
      >
        {msg.headline}
      </p>

      {/* Greeting + name + subtext */}
      <p
        className="font-garamond"
        style={{
          fontSize:     isMobile ? '14px' : '16px',
          color:        'var(--muted)',
          lineHeight:   1.65,
          marginBottom: 20,
        }}
      >
        {msg.subtext}{' '}
        <span className="font-cinzel uppercase" style={{ fontSize: isMobile ? '8px' : '9px', letterSpacing: '0.2em', color: 'var(--faint)' }}>
          — {name}
        </span>
      </p>

      {/* Counsel block */}
      <div
        style={{
          borderLeft:  '2px solid var(--gold)',
          paddingLeft: 16,
        }}
      >
        <p
          className="font-cormorant italic"
          style={{
            fontSize:   isMobile ? '13px' : '14px',
            color:      'var(--gold)',
            lineHeight: 1.7,
          }}
        >
          {msg.counsel}
        </p>
      </div>
    </motion.div>
  )
}
