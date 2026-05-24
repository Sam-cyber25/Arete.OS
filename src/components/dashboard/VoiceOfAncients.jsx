import { useMemo, useState } from 'react'
import { motion }            from 'framer-motion'

/* ── 40 day-seeded counsel entries ───────────────────────────── */
const ENTRIES = [
  /* ── Napoleon Bonaparte (8) ── */
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "Victory belongs to the most persevering. Every morning ask yourself what you have not yet done that must be done before the day ends.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "Impossible is a word found only in the dictionary of fools. I am no fool — I am the architect of my own fate. So are you.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "He who fears being conquered is already conquered. Fear is a fire — let it fuel you, not consume you.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "The battlefield is a scene of constant chaos. The commander who overcomes that chaos triumphs. Be the commander of your own day.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "Never interrupt your enemy when he is making a mistake. And never stop learning from your own. Failure is a teacher — bill it accordingly.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "Take time to deliberate, but when the time for action arrives, stop thinking and move. Hesitation has destroyed more men than any enemy blade.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "Courage must have hope to nourish it. Rise each day with the hunger of a man who has nothing yet and everything still to prove.",
  },
  {
    idol:    'Napoleon Bonaparte',
    portrait: 'napoleon',
    text:    "I am sometimes a fox and sometimes a lion. The whole secret of a great man lies in knowing when to be each. Adapt. Conquer.",
  },

  /* ── Alexander the Great (6) ── */
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "There is nothing impossible to him who will try. Every great empire began as an audacious thought in one determined mind.",
  },
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion. Become the lion first.",
  },
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "Whatever we gain by our sword cannot be lasting. But the strength gained by discipline and moderation — that is certain and durable.",
  },
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "Remember: upon the conduct of each depends the fate of all. Your discipline is not personal — it is your destiny made manifest.",
  },
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "Through every dark night there is a bright day after that. The east always answers the west. Push through — dawn is guaranteed.",
  },
  {
    idol:    'Alexander the Great',
    portrait: 'alexander',
    text:    "Heaven cannot brook two suns, nor earth two masters. Know what you are. Then become it without apology or hesitation.",
  },

  /* ── Marcus Aurelius (8) ── */
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "You have power over your mind — not outside events. Realize this fully, and you will find the strength you have been searching for.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "The impediment to action advances action. What stands in the way becomes the way. Today's obstacle is tomorrow's achievement.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "Waste no more time arguing about what a good man should be. Be one. The argument ends the moment you begin.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "Do not dream of what you lack — count what you have, and be grateful you have it. Gratitude is the foundation of all further progress.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "If it is not right, do not do it. If it is not true, do not say it. Discipline begins at the smallest choice — and so does character.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "You have been formed of three parts — body, breath, and mind. Only the mind is truly yours. Guard it as your most precious possession.",
  },
  {
    idol:    'Marcus Aurelius',
    portrait: 'marcus',
    text:    "Confine yourself to the present. The past is gone. The future is unknown. This moment is the only place action is possible — use it fully.",
  },

  /* ── Socrates (5) ── */
  {
    idol:    'Socrates',
    portrait: 'socrates',
    text:    "The unexamined life is not worth living. Each day without reflection is a day spent in the dark. What will you examine today?",
  },
  {
    idol:    'Socrates',
    portrait: 'socrates',
    text:    "I know that I know nothing — and that knowing changes everything. Begin always from humility. It is the door through which all wisdom enters.",
  },
  {
    idol:    'Socrates',
    portrait: 'socrates',
    text:    "Education is the kindling of a flame, not the filling of a vessel. Go out today and spark something in yourself and those around you.",
  },
  {
    idol:    'Socrates',
    portrait: 'socrates',
    text:    "Wonder is the beginning of wisdom. What are you wondering about today that you have not yet had the courage to pursue?",
  },
  {
    idol:    'Socrates',
    portrait: 'socrates',
    text:    "He is richest who is content with least, for contentment is the wealth of nature. Define what is truly enough — then go beyond it anyway.",
  },

  /* ── Conor McGregor (7) ── */
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "I was nowhere near as good as I am now, and I beat them all. Imagine where I am going. Imagine where you are going if you keep showing up.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "There are no shortcuts. You are either putting in the work or you are not. The scoreboard never lies.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "I don't need motivation. I am the motivation. I am the reason to work harder. Make yourself the reason — that source never runs dry.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "Doubt is only removed by action. If you're not acting, you're doubting. The remedy is always the same — move.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "We're not here just to participate. We're here to take over. Act accordingly — in every room, every conversation, every rep.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "Success takes sacrifice. Either you put in the work, or you put in excuses. Pick one. Only one of them builds anything.",
  },
  {
    idol:    'Conor McGregor',
    portrait: 'conor',
    text:    "Talent doesn't guarantee anything. Obsession does. Are you truly obsessed — or just mildly interested?",
  },

  /* ── Khabib Nurmagomedov (6) ── */
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "Before I smesh, I prepare. Preparation is not a detail — it is everything. How well are you preparing right now?",
  },
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "God gives everyone talent. What you do with it — that is your choice and your responsibility. No one is coming to make the choice for you.",
  },
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "Don't talk. Don't post. Just work. The results will speak when the time comes. Let the work be loud and the mouth be silent.",
  },
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "If you want to be the best, you have to kill your ego first. It gets in the way of learning. It gets in the way of becoming.",
  },
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "Every day I wake up and ask — what can I improve? That question, asked daily and answered honestly, is what makes champions.",
  },
  {
    idol:    'Khabib Nurmagomedov',
    portrait: 'khabib',
    text:    "Pressure makes diamonds. Embrace the hard days — they are not punishing you. They are building something in you that easy days never could.",
  },
]

/* ── Word-by-word fade animation ─────────────────────────────── */
const wordContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.045, delayChildren: 0.2 } },
}
const wordItem = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function VoiceOfAncients() {
  /* Stable day-seed — changes at midnight */
  const entry = useMemo(() => {
    const dayIdx = Math.floor(Date.now() / 86_400_000)
    return ENTRIES[dayIdx % ENTRIES.length]
  }, [])

  const words = entry.text.split(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="card"
      style={{
        position:   'relative',
        overflow:   'hidden',
        padding:    '32px 36px',
        borderTop:  '1px solid rgba(201,168,76,0.25)',
      }}
    >
      {/* Silhouette portrait backdrop — opacity 0.06 */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          backgroundImage: `url(/idols/${entry.portrait}.jpg)`,
          backgroundSize:  'auto 110%',
          backgroundPosition: 'right center',
          backgroundRepeat:   'no-repeat',
          filter:          'grayscale(100%) sepia(30%) brightness(0.2)',
          opacity:         0.06,
          maskImage:       'linear-gradient(to left, black 5%, transparent 60%)',
          WebkitMaskImage: 'linear-gradient(to left, black 5%, transparent 60%)',
          pointerEvents:   'none',
        }}
      />

      {/* Header label */}
      <p
        className="font-cinzel uppercase"
        style={{
          fontSize:      '12px',
          letterSpacing: '0.28em',
          color:         'var(--gold)',
          marginBottom:  20,
          opacity:       0.85,
        }}
      >
        Today's Counsel
      </p>

      {/* Word-by-word quote */}
      <motion.p
        className="font-cormorant italic"
        style={{
          fontSize:   '22px',
          lineHeight: 1.65,
          color:      'var(--text)',
          maxWidth:   680,
          marginBottom: 20,
          position:   'relative',
          zIndex:     1,
        }}
        variants={wordContainer}
        initial="hidden"
        animate="show"
      >
        &ldquo;
        {words.map((word, i) => (
          <motion.span key={i} variants={wordItem}>
            {word}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
        &rdquo;
      </motion.p>

      {/* Attribution */}
      <motion.p
        className="font-cinzel uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: words.length * 0.045 + 0.4, duration: 0.5 }}
        style={{
          fontSize:      '12px',
          letterSpacing: '0.2em',
          color:         'var(--muted)',
          position:      'relative',
          zIndex:        1,
        }}
      >
        — {entry.idol}
      </motion.p>
    </motion.div>
  )
}
