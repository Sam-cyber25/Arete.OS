import { motion } from 'framer-motion'
import { getDailyQuote } from '../../utils/quotes'

export default function QuoteHero() {
  const quote = getDailyQuote()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="card card-gold-top"
      style={{ textAlign: 'center', padding: '40px 48px' }}
    >
      <p
        className="font-cormorant italic mx-auto mb-5"
        style={{
          fontSize:   '28px',
          lineHeight: '1.55',
          color:      'var(--text)',
          maxWidth:   '680px',
          fontStyle:  'italic',
        }}
      >
        &ldquo;{quote.text}&rdquo;
      </p>
      <p
        className="font-cinzel uppercase tracking-widest"
        style={{ color: 'var(--muted)', fontSize: '10px', letterSpacing: '0.22em' }}
      >
        {quote.author}
      </p>
    </motion.div>
  )
}
