// Fixed ornamental background — all CSS animations, zero JS loops
// Layer 1: drifting micro-dot grid (bgDrift keyframe)
// Layer 2: corner filigree pulse (cornerPulse keyframe)
// Layer 3: central mandala slow rotate (mandalaRotate keyframe)
// Layer 4: gold horizontal scan line (scanLine keyframe)

const GOLD = '#C9A84C'

function CornerOrnament({ rotate = 0 }) {
  return (
    <svg
      width="200" height="200" viewBox="0 0 200 200" fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <line x1="0" y1="0" x2="150" y2="0"   stroke={GOLD} strokeWidth="0.7" opacity="0.6" />
      <line x1="0" y1="0" x2="0"   y2="150" stroke={GOLD} strokeWidth="0.7" opacity="0.6" />
      <line x1="8"  y1="8"  x2="120" y2="8"  stroke={GOLD} strokeWidth="0.3" opacity="0.35" />
      <line x1="8"  y1="8"  x2="8"   y2="120" stroke={GOLD} strokeWidth="0.3" opacity="0.35" />
      <polygon points="18,0 36,18 18,36 0,18" stroke={GOLD} strokeWidth="0.6" fill={GOLD} fillOpacity="0.15" opacity="0.8" />
      <circle cx="18" cy="18" r="2.5"         stroke={GOLD} strokeWidth="0.5" fill={GOLD} fillOpacity="0.5"  opacity="0.6" />
      <polygon points="150,0 158,7 150,14 142,7" stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.5" />
      <polygon points="0,150 7,158 0,166 -7,158" stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.5" />
      <circle cx="50"  cy="0" r="1.2" fill={GOLD} opacity="0.6" />
      <circle cx="90"  cy="0" r="0.8" fill={GOLD} opacity="0.45" />
      <circle cx="120" cy="0" r="0.8" fill={GOLD} opacity="0.45" />
      <circle cx="0" cy="50"  r="1.2" fill={GOLD} opacity="0.6" />
      <circle cx="0" cy="90"  r="0.8" fill={GOLD} opacity="0.45" />
      <circle cx="0" cy="120" r="0.8" fill={GOLD} opacity="0.45" />
      <path d="M 50,0 Q 36,18 50,36"  stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M 0,50 Q 18,36 36,50"  stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M 55,0 Q 28,28 0,55"   stroke={GOLD} strokeWidth="0.3" fill="none" opacity="0.3" />
      <path d="M 80,0 Q 40,40 0,80"   stroke={GOLD} strokeWidth="0.2" fill="none" opacity="0.2" />
      <path d="M 108,0 Q 54,54 0,108" stroke={GOLD} strokeWidth="0.15" fill="none" opacity="0.15" />
      <path d="M 36,0  Q 30,9  36,18" stroke={GOLD} strokeWidth="0.35" fill="none" opacity="0.45" />
      <path d="M 0,36  Q 9,30  18,36" stroke={GOLD} strokeWidth="0.35" fill="none" opacity="0.45" />
    </svg>
  )
}

function CentralMandala() {
  const rings  = [28, 58, 95, 140, 190, 240]
  const angles = Array.from({ length: 16 }, (_, i) => (i * 360) / 16)

  return (
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none">
      <circle cx="300" cy="300" r="2" fill={GOLD} opacity="0.5" />
      {rings.map((r, i) => (
        <circle key={r} cx="300" cy="300" r={r}
          stroke={GOLD} strokeWidth="0.4" opacity={0.5 - i * 0.06} />
      ))}
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180
        return (
          <line key={a}
            x1="300" y1="300"
            x2={300 + 240 * Math.cos(rad)}
            y2={300 + 240 * Math.sin(rad)}
            stroke={GOLD} strokeWidth="0.3" opacity="0.3"
          />
        )
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a  = (i * 45 * Math.PI) / 180
        const cx = 300 + 58 * Math.cos(a)
        const cy = 300 + 58 * Math.sin(a)
        return (
          <ellipse key={i} cx={cx} cy={cy} rx="18" ry="9"
            transform={`rotate(${i * 45}, ${cx}, ${cy})`}
            stroke={GOLD} strokeWidth="0.35" fill="none" opacity="0.35"
          />
        )
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a  = (i * 45 * Math.PI) / 180
        const cx = 300 + 140 * Math.cos(a)
        const cy = 300 + 140 * Math.sin(a)
        return (
          <polygon key={i}
            points={`${cx},${cy - 5} ${cx + 4},${cy} ${cx},${cy + 5} ${cx - 4},${cy}`}
            stroke={GOLD} strokeWidth="0.3" fill="none" opacity="0.45"
          />
        )
      })}
    </svg>
  )
}

export default function OrnamentalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Layer 1 — drifting micro-dot grid */}
      <div className="absolute inset-0 bg-micro-pattern" />

      {/* Layer 4 — gold scan line */}
      <div className="scan-line" />

      {/* Layer 3 — central mandala, slow rotate */}
      <div
        className="absolute mandala-wrap"
        style={{ top: '50%', left: '50%', opacity: 0.025 }}
      >
        <CentralMandala />
      </div>

      {/* Layer 2 — corner ornaments, pulsing */}
      <div className="absolute top-0 left-0 corner-ornament">
        <CornerOrnament rotate={0} />
      </div>
      <div className="absolute top-0 right-0 corner-ornament corner-ornament-2">
        <CornerOrnament rotate={90} />
      </div>
      <div className="absolute bottom-0 right-0 corner-ornament corner-ornament-3">
        <CornerOrnament rotate={180} />
      </div>
      <div className="absolute bottom-0 left-0 corner-ornament corner-ornament-4">
        <CornerOrnament rotate={270} />
      </div>
    </div>
  )
}
