import Sidebar              from './Sidebar'
import Header               from './Header'
import BottomNav            from './BottomNav'
import OrnamentalBackground from './OrnamentalBackground'
import IdolBackground       from './IdolBackground'
import { useIsMobile }      from '../../hooks/useIsMobile'
import { useApp }           from '../../context/AppContext'

/* Full-height flex pages that manage their own internal layout */
const FULL_HEIGHT_PAGES = new Set(['schedule', 'whiteboard', 'stickynotes', 'planner'])

export default function Layout({ children }) {
  const isMobile      = useIsMobile()
  const { currentPage } = useApp()
  const isFullHeight  = FULL_HEIGHT_PAGES.has(currentPage)

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <OrnamentalBackground />
      <IdolBackground />

      {/* Desktop sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
        <Header />

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            /* Bottom padding on mobile prevents content from hiding behind bottom nav */
            paddingBottom: isMobile ? 72 : 0,
            /* Full-height pages handle their own layout; content pages get outer spacing */
            ...(isFullHeight ? {} : {
              paddingTop:   isMobile ? 8 : 0,
              paddingLeft:  isMobile ? 0 : 0,
              paddingRight: isMobile ? 0 : 0,
            }),
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      {isMobile && <BottomNav />}
    </div>
  )
}
