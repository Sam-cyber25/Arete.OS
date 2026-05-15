// "Dark Knight Council" background — five layered SVG/CSS elements
// Layer 1: Architectural perspective grid (gold lines, opacity 0.02)
// Layer 2: Gothic structural corner elements (blueprint meets cathedral)
// Layer 3: AO hexagonal command emblem (slowly rotates)
// Layer 4: Radial warm gradient (subtle top-center light source)
// Layer 5: Gold scan line (barely visible, 4s loop)

const GOLD = '#C9A84C'

/* ── Gothic corner architecture ───────────────────────────────── */
function GothicCorner({ rotate = 0 }) {
  return (
    <svg
      width="180" height="180" viewBox="0 0 180 180" fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Primary L-frame */}
      <line x1="0" y1="0" x2="160" y2="0" stroke={GOLD} strokeWidth="0.8" opacity="0.65" />
      <line x1="0" y1="0" x2="0" y2="160" stroke={GOLD} strokeWidth="0.8" opacity="0.65" />

      {/* Blueprint inner margin */}
      <line x1="10" y1="10" x2="110" y2="10" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />
      <line x1="10" y1="10" x2="10" y2="110" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />

      {/* Gothic pointed arch */}
      <path d="M 0,80 L 0,40 Q 0,0 40,0 L 80,0" stroke={GOLD} strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M 0,60 L 0,30 Q 0,0 30,0 L 60,0" stroke={GOLD} strokeWidth="0.3" fill="none" opacity="0.22" />

      {/* Tick marks along top edge */}
      <line x1="30"  y1="0" x2="30"  y2="7"  stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
      <line x1="60"  y1="0" x2="60"  y2="5"  stroke={GOLD} strokeWidth="0.4" opacity="0.38" />
      <line x1="90"  y1="0" x2="90"  y2="7"  stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
      <line x1="120" y1="0" x2="120" y2="5"  stroke={GOLD} strokeWidth="0.4" opacity="0.38" />

      {/* Tick marks along left edge */}
      <line x1="0" y1="30"  x2="7"  y2="30"  stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
      <line x1="0" y1="60"  x2="5"  y2="60"  stroke={GOLD} strokeWidth="0.4" opacity="0.38" />
      <line x1="0" y1="90"  x2="7"  y2="90"  stroke={GOLD} strokeWidth="0.5" opacity="0.5" />
      <line x1="0" y1="120" x2="5"  y2="120" stroke={GOLD} strokeWidth="0.4" opacity="0.38" />

      {/* Corner anchor diamond */}
      <polygon points="0,0 10,0 0,10" fill={GOLD} fillOpacity="0.4" opacity="0.7" />
      <circle cx="0" cy="0" r="2.5" fill={GOLD} opacity="0.5" />

      {/* End-of-line diamonds */}
      <polygon points="160,0 164,4 160,8 156,4" stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.4" />
      <polygon points="0,160 4,164 0,168 -4,164" stroke={GOLD} strokeWidth="0.4" fill="none" opacity="0.4" />

      {/* Fine diagonal precision line */}
      <line x1="0" y1="0" x2="50" y2="50" stroke={GOLD} strokeWidth="0.2" opacity="0.12" strokeDasharray="3 6" />
    </svg>
  )
}

/* ── AO hexagonal emblem (Wayne Enterprises meets Roman senate) ─ */
function AoEmblem() {
  // Hexagon points for a regular hexagon centred at 200,200, radius 170
  const hex = (r, cx = 200, cy = 200) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180)
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')

  // 6 triangles from center
  const triangles = Array.from({ length: 6 }, (_, i) => {
    const a1 = ((i * 60 - 30) * Math.PI) / 180
    const a2 = (((i + 1) * 60 - 30) * Math.PI) / 180
    const r  = 80
    return `200,200 ${200 + r * Math.cos(a1)},${200 + r * Math.sin(a1)} ${200 + r * Math.cos(a2)},${200 + r * Math.sin(a2)}`
  })

  return (
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
      {/* Outer hex rings */}
      <polygon points={hex(170)} stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      <polygon points={hex(145)} stroke={GOLD} strokeWidth="0.35" opacity="0.35" />

      {/* Inner hex (rotated 30°) */}
      <polygon
        points={hex(120)}
        stroke={GOLD} strokeWidth="0.3" opacity="0.25"
        style={{ transform: 'rotate(30deg)', transformOrigin: '200px 200px' }}
      />

      {/* Radial lines from center to hex vertices */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 30) * Math.PI) / 180
        return (
          <line
            key={i}
            x1="200" y1="200"
            x2={200 + 170 * Math.cos(a)}
            y2={200 + 170 * Math.sin(a)}
            stroke={GOLD} strokeWidth="0.3" opacity="0.3"
          />
        )
      })}

      {/* 6 inner triangles */}
      {triangles.map((pts, i) => (
        <polygon key={i} points={pts} stroke={GOLD} strokeWidth="0.4" fill={GOLD} fillOpacity="0.04" opacity="0.5" />
      ))}

      {/* Center circle */}
      <circle cx="200" cy="200" r="32" stroke={GOLD} strokeWidth="0.5" opacity="0.55" />
      <circle cx="200" cy="200" r="22" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />

      {/* AO monogram */}
      <text
        x="200" y="207"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="18"
        fontWeight="400"
        fill={GOLD}
        opacity="0.9"
        letterSpacing="4"
      >
        AO
      </text>

      {/* Outer precision ring */}
      <circle cx="200" cy="200" r="190" stroke={GOLD} strokeWidth="0.25" opacity="0.15" strokeDasharray="4 8" />
    </svg>
  )
}

/* ── Perspective grid (architectural floor plane) ────────────── */
function PerspectiveGrid() {
  const W = 1920
  const H = 1080
  const VX = W / 2   // vanishing point X
  const VY = H * 0.4 // vanishing point Y (above center)

  const lines = []

  // Horizontal lines (spaced logarithmically toward horizon)
  for (let i = 1; i <= 14; i++) {
    const t = i / 14
    const y = VY + (H - VY) * Math.pow(t, 1.4)
    lines.push(<line key={`h${i}`} x1="0" y1={y} x2={W} y2={y} stroke={GOLD} strokeWidth="0.4" opacity={0.012 + t * 0.01} />)
  }

  // Radial lines converging to vanishing point
  const cols = 20
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * W
    lines.push(
      <line
        key={`r${i}`}
        x1={x} y1={H}
        x2={VX} y2={VY}
        stroke={GOLD} strokeWidth="0.3"
        opacity={0.018}
      />
    )
  }

  return (
    <svg
      width="100%" height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0 }}
    >
      {lines}
    </svg>
  )
}

export default function OrnamentalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* Layer 1 — Architectural perspective grid */}
      <PerspectiveGrid />

      {/* Layer 2 — Radial warm atmosphere gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(201,168,76,0.03) 0%, transparent 65%)',
        }}
      />

      {/* Layer 3 — Gothic corner architecture, pulsing */}
      <div className="absolute top-0 left-0 corner-ornament">
        <GothicCorner rotate={0} />
      </div>
      <div className="absolute top-0 right-0 corner-ornament corner-ornament-2">
        <GothicCorner rotate={90} />
      </div>
      <div className="absolute bottom-0 right-0 corner-ornament corner-ornament-3">
        <GothicCorner rotate={180} />
      </div>
      <div className="absolute bottom-0 left-0 corner-ornament corner-ornament-4">
        <GothicCorner rotate={270} />
      </div>

      {/* Layer 4 — AO hexagonal emblem, slow rotate */}
      <div
        className="absolute mandala-wrap"
        style={{ top: '50%', left: '50%', opacity: 0.04 }}
      >
        <AoEmblem />
      </div>

      {/* Layer 5 — Gold scan line */}
      <div className="scan-line" />
    </div>
  )
}
