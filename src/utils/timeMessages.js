/**
 * Personalised time-aware message system for Arête OS.
 *
 * Schedule context:
 *   05:00 – 06:30  Gym / Morning training
 *   06:30 – 07:00  Post-gym recovery, school prep
 *   07:00 – 12:00  CBSE school blocks
 *   12:00 – 13:00  Lunch / transition
 *   13:00 – 17:00  Next Toppers coaching
 *   17:00 – 18:00  Deliberate recovery
 *   18:00 – 20:00  Evening work — freelance / Project Arête / revision
 *   20:00 – 21:00  Night review
 *   21:00 – 22:00  Spiritual practice
 *   22:00 – 00:00  Sleep
 *   00:00 – 05:00  Deep sleep
 */

const TIME_MESSAGES = [
  {
    start: 5, end: 6,
    period: 'PRE-DAWN',
    headline: 'The Forge Opens',
    subtext: 'Gym calls. The world is still asleep — your edge grows in the dark.',
    counsel: 'Attack the body first. Footwork, striking, strength. Everything else follows from physical dominance.',
  },
  {
    start: 6, end: 7,
    period: 'DAWN',
    headline: 'Post-Training Window',
    subtext: 'Protein within the hour. Shower. School demands a warrior\'s focus, not a tired one.',
    counsel: 'Recovery is part of the discipline. Eat, reset, and arrive sharp.',
  },
  {
    start: 7, end: 8,
    period: 'MORNING I',
    headline: 'First Hour of School',
    subtext: 'Front-row focus. You are not here to attend — you are here to dominate.',
    counsel: 'AIR 1 is built in moments like this. Ruthless attention in every class.',
  },
  {
    start: 8, end: 9,
    period: 'MORNING II',
    headline: 'Mid-Morning Concentration',
    subtext: 'Fatigue is settling in for others. This is precisely where you accelerate.',
    counsel: 'Stay hydrated. Sharp notes. Every detail is a brick in the AIR 1 structure.',
  },
  {
    start: 9, end: 10,
    period: 'MORNING III',
    headline: 'The Grind Continues',
    subtext: 'School is your current arena. Master every subject presented today.',
    counsel: 'One concept per class, understood deeply — not merely recalled.',
  },
  {
    start: 10, end: 11,
    period: 'LATE MORNING',
    headline: 'The Hours That Compound',
    subtext: 'What you absorb here reduces load tonight. The afternoon demands your best.',
    counsel: 'Listen with intent. Each lesson absorbed is a board mark banked.',
  },
  {
    start: 11, end: 12,
    period: 'PRE-NOON',
    headline: 'Approaching Midday',
    subtext: 'Final school block. Finish strong — Next Toppers begins after lunch.',
    counsel: 'Consistency compounds. Show up the same in the last class as the first.',
  },
  {
    start: 12, end: 13,
    period: 'MIDDAY',
    headline: 'Fuel & Reset',
    subtext: 'Eat with intention — your body and brain are machines. Feed them properly.',
    counsel: 'Protein, carbs, 15 minutes of stillness. The afternoon requires peak output.',
  },
  {
    start: 13, end: 15,
    period: 'NEXT TOPPERS I',
    headline: 'Coaching Arena',
    subtext: 'Next Toppers has begun. Your competitors are in the same room — outlearn them.',
    counsel: 'Ask one question per session that no one else thought to ask.',
  },
  {
    start: 15, end: 17,
    period: 'NEXT TOPPERS II',
    headline: 'Deep Work Phase',
    subtext: 'Mental stamina determines AIR 1, not raw intelligence. Push through the fatigue.',
    counsel: 'The tired mind that keeps going becomes the sharp mind others cannot match.',
  },
  {
    start: 17, end: 18,
    period: 'TRANSITION',
    headline: 'Deliberate Recovery',
    subtext: 'Strategic rest — not laziness. Recharge before the evening session.',
    counsel: 'Stretch. Walk. 20 minutes of intentional downtime is an investment in tonight.',
  },
  {
    start: 18, end: 20,
    period: 'EVENING WORK',
    headline: 'Second Wind',
    subtext: 'Freelance, revision, or Project Arête. The evening is your own kingdom.',
    counsel: 'One hour of deep work tonight compounds into a thousand over the year.',
  },
  {
    start: 20, end: 21,
    period: 'NIGHT REVIEW',
    headline: 'The Closing Hour',
    subtext: 'Review the day. What was conquered? What must be corrected tomorrow?',
    counsel: 'Journal one win and one lesson before the day closes. No exceptions.',
  },
  {
    start: 21, end: 22,
    period: 'SPIRITUAL HOUR',
    headline: 'Still the Mind',
    subtext: 'Daily spiritual practice. This is the pillar everything else rests upon.',
    counsel: 'The warrior who knows stillness is unconquerable. Meditate. Pray. Reflect.',
  },
  {
    start: 22, end: 24,
    period: 'REST',
    headline: 'Rest is a Weapon',
    subtext: 'Sleep is when the body rebuilds and the mind consolidates what was learned.',
    counsel: 'AIR 1 requires a rested mind. This is not weakness — it is strategy. Sleep.',
  },
  {
    start: 0, end: 5,
    period: 'MIDNIGHT',
    headline: 'You Should Be Asleep',
    subtext: 'The warrior who neglects recovery loses the long war. Tomorrow begins at 5AM.',
    counsel: 'Close your eyes. The discipline continues in the quality of your rest.',
  },
]

/**
 * Returns the message object for the current hour.
 */
export function getTimeMessage() {
  const hour = new Date().getHours()
  for (const msg of TIME_MESSAGES) {
    const { start, end } = msg
    // Handle same-day ranges
    if (start < end) {
      if (hour >= start && hour < end) return msg
    } else {
      // Wraps midnight: start >= end (e.g. 22-0 doesn't apply here, but safe to handle)
      if (hour >= start || hour < end) return msg
    }
  }
  // Fallback — should never reach here
  return TIME_MESSAGES[0]
}
