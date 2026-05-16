import { motion }          from 'framer-motion'
import SettingsPanel       from '../components/settings/SettingsPanel'
import OrnamentalDivider   from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

export default function SettingsPage() {
  return (
    <motion.div {...PAGE} className="page-container" style={{ maxWidth: 740, margin: '0 auto' }}>
      <div className="mb-8">
        <p
          className="font-cinzel uppercase tracking-widest"
          style={{ fontSize: '11px', color: 'var(--bronze)', letterSpacing: '0.25em', marginBottom: 4 }}
        >
          Configura
        </p>
        <p className="font-cormorant" style={{ fontSize: '28px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>
          Settings
        </p>
      </div>
      <OrnamentalDivider opacity={0.15} />
      <SettingsPanel />
    </motion.div>
  )
}
