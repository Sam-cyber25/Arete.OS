import { motion } from 'framer-motion'
import { useApp }  from '../../context/AppContext'

export default function VoiceOrb() {
  const { setCurrentPage } = useApp()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="card flex flex-col items-center justify-center gap-5"
      style={{ padding: '32px 24px' }}
    >
      <p className="section-label">Voice</p>

      <button
        onClick={() => setCurrentPage('voice')}
        className="relative flex items-center justify-center focus:outline-none"
        style={{ width: 90, height: 90 }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '1px solid var(--border)',
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            position: 'absolute', inset: 12,
            borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        />
        {/* Core */}
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '1px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span
            className="font-cinzel"
            style={{ color: 'var(--gold)', fontSize: '9px', letterSpacing: '0.1em' }}
          >
            III
          </span>
        </div>
      </button>

      <p
        className="font-garamond italic text-center"
        style={{ color: 'var(--muted)', fontSize: '13px' }}
      >
        Ready
      </p>
    </motion.div>
  )
}
