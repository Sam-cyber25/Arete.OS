import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { getGreeting } from '../../utils/dateHelpers'
import { getDailyQuote } from '../../utils/quotes'

export default function GreetingCard() {
  const { settings } = useApp()
  const name = settings?.userName || 'Sam'
  const greeting = getGreeting()
  const quote = getDailyQuote()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.06) 50%, rgba(3,7,18,0) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}
        >
          {greeting},{' '}
          <span style={{ color: '#3b82f6' }}>{name}.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm leading-relaxed max-w-2xl"
          style={{ fontFamily: 'Syne, sans-serif', color: '#64748b' }}
        >
          &ldquo;{quote}&rdquo;
        </motion.p>
      </div>
    </motion.div>
  )
}
