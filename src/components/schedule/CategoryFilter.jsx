import { CAT_COLORS, CATEGORIES } from './scheduleConstants'

export default function CategoryFilter({ activeFilter, onFilterChange }) {
  const all = ['ALL', ...CATEGORIES]

  return (
    <div
      style={{
        flexShrink:   0,
        height:       40,
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        padding:      '0 24px',
        background:   '#0C0A08',
        borderBottom: '1px solid #1A1610',
        overflowX:    'auto',
        scrollbarWidth: 'none',
      }}
    >
      {all.map((cat) => {
        const isActive  = activeFilter === cat
        const color     = cat === 'ALL' ? '#C9A84C' : (CAT_COLORS[cat] || '#4A3F32')
        const label     = cat.toUpperCase()

        return (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className="font-cinzel"
            style={{
              flexShrink:    0,
              fontSize:      '8px',
              letterSpacing: '0.14em',
              padding:       '3px 10px',
              border:        `1px solid ${isActive ? color : 'var(--border)'}`,
              background:    isActive ? `${color}22` : 'transparent',
              color:         isActive ? color : 'var(--faint)',
              cursor:        'pointer',
              textTransform: 'uppercase',
              transition:    'all 0.14s',
              whiteSpace:    'nowrap',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
