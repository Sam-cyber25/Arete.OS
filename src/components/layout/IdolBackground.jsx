import { motion, AnimatePresence } from 'framer-motion'
import { useApp }                  from '../../context/AppContext'
import { useIsMobile }             from '../../hooks/useIsMobile'

/* ── One portrait per page ────────────────────────────────────── */
const PAGE_PORTRAIT = {
  dashboard:   'napoleon',
  goals:       'alexander',
  memory:      'marcus',
  planner:     'socrates',
  analytics:   'conor',
  schedule:    'khabib',
  journal:     'marcus',
  whiteboard:  'charles',
  stickynotes: 'charles',
  settings:    'napoleon',
}

export default function IdolBackground() {
  const { currentPage } = useApp()
  const isMobile        = useIsMobile()
  const portrait        = PAGE_PORTRAIT[currentPage] || 'napoleon'
  const targetOpacity   = isMobile ? 0.08 : 0.12

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
    >
      <AnimatePresence>
        <motion.img
          key={portrait}
          src={`/idols/${portrait}.jpg`}
          alt=""
          loading="lazy"
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: targetOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position:              'absolute',
            top:                   0,
            left:                  '50%',
            transform:             'translateX(-50%)',
            height:                '100%',
            width:                 'auto',
            minWidth:              '100%',
            objectFit:             'cover',
            objectPosition:        'center top',
            filter:                'grayscale(100%) sepia(40%) brightness(0.25) contrast(1.2)',
            maskImage:             'radial-gradient(ellipse 65% 85% at 50% 35%, black 15%, transparent 72%)',
            WebkitMaskImage:       'radial-gradient(ellipse 65% 85% at 50% 35%, black 15%, transparent 72%)',
            userSelect:            'none',
            WebkitUserDrag:        'none',
          }}
        />
      </AnimatePresence>
    </div>
  )
}
