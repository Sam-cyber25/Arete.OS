import { motion, AnimatePresence } from 'framer-motion'
import { useApp }                  from '../../context/AppContext'
import { useIsMobile }             from '../../hooks/useIsMobile'

const PAGE_PORTRAIT = {
  dashboard:   'napoleon',
  goals:       'alexander',
  disciplines: 'marcus',
  memory:      'marcus',
  planner:     'socrates',
  analytics:   'conor',
  schedule:    'khabib',
  journal:     'marcus',
  whiteboard:  'charles',
  stickynotes: 'charles',
  settings:    'napoleon',
}

const IMG_STYLE = {
  filter: 'grayscale(100%) sepia(20%) brightness(0.2) contrast(1.4)',
  userSelect: 'none',
  WebkitUserDrag: 'none',
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  objectPosition: 'center top',
}

export default function IdolBackground() {
  const { currentPage } = useApp()
  const isMobile        = useIsMobile()
  const portrait        = PAGE_PORTRAIT[currentPage] || 'napoleon'

  /* On mobile, portraits are hidden — too distracting on small screens */
  if (isMobile) return null

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
        {/* ── Left side portrait ── */}
        <motion.div
          key={`left-${portrait}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '22%',
            height: '100%',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <img
            src={`/idols/${portrait}.jpg`}
            alt=""
            loading="lazy"
            aria-hidden="true"
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
            style={IMG_STYLE}
          />
        </motion.div>

        {/* ── Right side portrait (mirrored) ── */}
        <motion.div
          key={`right-${portrait}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0, right: 0,
            width: '22%',
            height: '100%',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <img
            src={`/idols/${portrait}.jpg`}
            alt=""
            loading="lazy"
            aria-hidden="true"
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
            style={{ ...IMG_STYLE, transform: 'scaleX(-1)' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
