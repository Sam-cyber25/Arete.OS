import { CAT_COLORS, CATEGORIES } from './scheduleConstants'
import { useIsMobile }            from '../../hooks/useIsMobile'

export default function CategoryFilter({ activeFilter, onFilterChange }) {
  const isMobile = useIsMobile()
  const all = ['ALL', ...CATEGORIES]

  return (
    <div
      style={{
        flexShrink:   0,
        height:       isMobile ? 48 : 40,
        display:      'flex',
        alignItems:   'center',
        gap:          isMobile ? 8 : 6,
        padding:      isMobile ? '0 16px' : '0 24px',
        background:   '#0C0A08',
        borderBottom: '1px solid #1A1610',
        overflowX:    'auto',
        scrollbarWidth: 'none',
        position:     'sticky',
        top:          0,
        zIndex:       10,
        /* Fade edges on mobile to hint scrollability */
        maskImage:    isMobile
          ? 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)'
          : undefined,
        WebkitMaskImage: isMobile
          ? 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)'
          : undefined,
      }}
    >
      {all.map((cat) => {
        const isActive  = activeFilter === cat
        const color     = cat === 'ALL' ? '#C9A84C' : (CAT_COLORS[cat] || '#7A6A58')
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
              padding:       isMobile ? '8px 14px' : '3px 10px',
              border:        `1px solid ${isActive ? color : 'var(--border)'}`,
              background:    isActive ? `${color}22` : 'transparent',
              color:         isActive ? color : 'var(--faint)',
              cursor:        'pointer',
              textTransform: 'uppercase',
              transition:    'all 0.14s',
              whiteSpace:    'nowrap',
              minWidth:      'fit-content',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
