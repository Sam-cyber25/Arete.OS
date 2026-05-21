import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Universal portal modal / bottom-sheet.
 *
 * Renders into document.body via createPortal — completely outside every
 * parent stacking context, so it never gets clipped by the sidebar or
 * any layout wrapper.
 *
 * Props
 *   isOpen      – controls visibility + enter/exit animation
 *   onClose     – called on backdrop click, Escape key
 *   bottomSheet – always render as bottom-sheet (even on desktop)
 *                 when false (default): bottom-sheet on mobile, centred on desktop
 */
export default function Modal({ isOpen, onClose, children, bottomSheet = false }) {
  /* Lock body scroll while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* Escape key */
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const isMobile      = window.innerWidth < 768
  const useSheet      = bottomSheet || isMobile

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────── */}
          <motion.div
            key="modal-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position : 'fixed',
              inset    : 0,
              zIndex   : 9998,
              background: 'rgba(0,0,0,0.75)',
            }}
          />

          {/* ── Content ──────────────────────────────────── */}
          {useSheet ? (
            /* Bottom-sheet */
            <motion.div
              key="modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position : 'fixed',
                bottom   : 0,
                left     : 0,
                width    : '100vw',
                maxHeight: '88vh',
                overflowY: 'auto',
                background: '#13110E',
                borderTop: '1px solid rgba(201,168,76,0.35)',
                borderRadius: '4px 4px 0 0',
                padding  : '24px 20px 48px',
                zIndex   : 9999,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Drag handle */}
              <div style={{
                width       : 40,
                height      : 3,
                background  : '#2A2520',
                borderRadius: 2,
                margin      : '0 auto 20px',
              }} />
              {children}
            </motion.div>
          ) : (
            /* Centred dialog — x/y keep the translate while Framer animates scale/opacity */
            <motion.div
              key="modal-dialog"
              initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.97 }}
              animate={{ x: '-50%', y: '-50%', opacity: 1, scale: 1    }}
              exit   ={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position : 'fixed',
                top      : '50%',
                left     : '50%',
                width    : 540,
                maxWidth : 'calc(100vw - 48px)',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: '#13110E',
                border   : '1px solid #2A2520',
                borderTop: '1px solid rgba(201,168,76,0.4)',
                borderRadius: 2,
                padding  : 32,
                zIndex   : 9999,
              }}
            >
              {children}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
