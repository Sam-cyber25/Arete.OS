const GOLD = '#C9A84C'

export default function OrnamentalDivider({ opacity = 0.14 }) {
  return (
    <svg
      width="100%" height="18" viewBox="0 0 900 18"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      style={{ display: 'block', opacity }}
    >
      {/* Main horizontal lines */}
      <line x1="0"   y1="9" x2="420" y2="9" stroke={GOLD} strokeWidth="0.6" />
      <line x1="480" y1="9" x2="900" y2="9" stroke={GOLD} strokeWidth="0.6" />

      {/* Center diamond */}
      <polygon points="450,2 458,9 450,16 442,9" stroke={GOLD} strokeWidth="0.7" fill={GOLD} fillOpacity="0.08" />
      <circle cx="450" cy="9" r="1.5" fill={GOLD} />

      {/* Left accent diamonds */}
      <polygon points="280,6 285,9 280,12 275,9" stroke={GOLD} strokeWidth="0.4" fill="none" />
      <polygon points="160,6 165,9 160,12 155,9" stroke={GOLD} strokeWidth="0.35" fill="none" opacity="0.7" />

      {/* Right accent diamonds */}
      <polygon points="620,6 625,9 620,12 615,9" stroke={GOLD} strokeWidth="0.4" fill="none" />
      <polygon points="740,6 745,9 740,12 735,9" stroke={GOLD} strokeWidth="0.35" fill="none" opacity="0.7" />

      {/* Left flourish near center */}
      <path d="M 430,9 Q 422,4 414,9" stroke={GOLD} strokeWidth="0.5" fill="none" />
      <circle cx="414" cy="9" r="1" fill={GOLD} />

      {/* Right flourish near center */}
      <path d="M 470,9 Q 478,4 486,9" stroke={GOLD} strokeWidth="0.5" fill="none" />
      <circle cx="486" cy="9" r="1" fill={GOLD} />

      {/* Tiny end-cap circles */}
      <circle cx="0"   cy="9" r="1.5" fill={GOLD} opacity="0.4" />
      <circle cx="900" cy="9" r="1.5" fill={GOLD} opacity="0.4" />
    </svg>
  )
}
