import { useEffect } from 'react'
import { motion }    from 'framer-motion'

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    sessionStorage.setItem('arete_splash_shown', '1')
    const t = setTimeout(onComplete, 3800)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     '#0C0A08',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
      }}
    >
      {/* ── 1. Horizontal line draws from center out ── */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          height:     1,
          background: '#C9A84C',
          opacity:    0.4,
          marginBottom: 28,
        }}
      />

      {/* ── 2. AÈRETE wordmark ── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily:    'Cinzel, serif',
          fontWeight:    700,
          fontSize:      32,
          color:         '#C9A84C',
          letterSpacing: '0.4em',
          margin:        0,
          marginBottom:  14,
          textIndent:    '0.4em', // offset for letter-spacing
        }}
      >
        AÈRETE
      </motion.p>

      {/* ── 3. Tagline ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        style={{
          fontFamily:    'Cinzel, serif',
          fontWeight:    400,
          fontSize:      9,
          color:         '#8A7A65',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          margin:        0,
          marginBottom:  10,
          textIndent:    '0.3em',
        }}
      >
        Move With Consistency
      </motion.p>

      {/* ── 4. Since 2026 ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.4 }}
        style={{
          fontFamily: 'EB Garamond, serif',
          fontStyle:  'italic',
          fontSize:   11,
          color:      '#6B5F4E',
          margin:     0,
          letterSpacing: '0.06em',
        }}
      >
        Since 2026
      </motion.p>

      {/* ── 5. Fade-out overlay — appears at 3.2s, covers by 3.8s ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 0.6, ease: 'easeIn' }}
        style={{
          position:      'absolute',
          inset:         0,
          background:    '#0C0A08',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
