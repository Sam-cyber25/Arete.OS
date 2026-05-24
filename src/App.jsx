import { lazy, Suspense, useEffect, useCallback, useState } from 'react'
import { AnimatePresence }                                   from 'framer-motion'
import { supabase }                                          from './lib/supabase'
import { AppProvider, useApp }                               from './context/AppContext'
import LoginPage                                             from './components/auth/LoginPage'
import Layout                                                from './components/layout/Layout'
import CommandPalette                                        from './components/CommandPalette'
import Toast                                                 from './components/layout/Toast'
import SplashScreen                                          from './components/SplashScreen'

// Lazy-loaded pages
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const GoalsPage      = lazy(() => import('./pages/GoalsPage'))
const DisciplinesPage= lazy(() => import('./pages/DisciplinesPage'))
const MemoryPage     = lazy(() => import('./pages/MemoryPage'))
const AnalyticsPage  = lazy(() => import('./pages/AnalyticsPage'))
const SchedulePage   = lazy(() => import('./pages/SchedulePage'))
const JournalPage    = lazy(() => import('./pages/JournalPage'))
const PlannerPage    = lazy(() => import('./pages/PlannerPage'))
const WhiteboardPage = lazy(() => import('./pages/WhiteboardPage'))
const StickyNotesPage= lazy(() => import('./pages/StickyNotesPage'))
const SettingsPage   = lazy(() => import('./pages/SettingsPage'))
const CodexPage      = lazy(() => import('./pages/CodexPage'))
const CorpusPage     = lazy(() => import('./pages/CorpusPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <span className="font-mono" style={{ fontSize: '18px', color: 'var(--gold)' }}>—</span>
    </div>
  )
}

function AuthLoader() {
  return (
    <div
      style={{
        minHeight:      '100vh',
        background:     '#0C0A08',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          fontFamily:    'Cinzel, serif',
          fontSize:      '11px',
          letterSpacing: '0.3em',
          color:         'rgba(201,168,76,0.4)',
          textTransform: 'uppercase',
        }}
      >
        — loading —
      </p>
    </div>
  )
}

const PAGES = {
  dashboard:   Dashboard,
  goals:       GoalsPage,
  disciplines: DisciplinesPage,
  memory:      MemoryPage,
  analytics:   AnalyticsPage,
  schedule:    SchedulePage,
  journal:     JournalPage,
  planner:     PlannerPage,
  whiteboard:  WhiteboardPage,
  stickynotes: StickyNotesPage,
  settings:    SettingsPage,
  codex:       CodexPage,
  corpus:      CorpusPage,
}

function AppInner() {
  const { currentPage, setCurrentPage, toasts, dismissToast } = useApp()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const handleKeyDown = useCallback(
    (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod   = isMac ? e.metaKey : e.ctrlKey

      if (mod && e.key === 'k') { e.preventDefault(); setPaletteOpen((p) => !p); return }
      if (mod && e.key === 'n') { e.preventDefault(); setCurrentPage('memory')      }
      if (mod && e.key === 'j') { e.preventDefault(); setCurrentPage('journal')     }
      if (mod && e.key === 'w') { e.preventDefault(); setCurrentPage('whiteboard')  }
      if (mod && e.key === 'p') { e.preventDefault(); setCurrentPage('planner')     }
      if (mod && e.key === 'd') { e.preventDefault(); setCurrentPage('disciplines') }
      if (e.key === 'Escape') setPaletteOpen(false)
    },
    [setCurrentPage]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const PageComponent = PAGES[currentPage] || Dashboard

  return (
    <>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <PageComponent key={currentPage} />
          </AnimatePresence>
        </Suspense>

        {/* Toast stack */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </Layout>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}

export default function App() {
  /* undefined = still checking, null = not signed in, object = signed in */
  const [session, setSession] = useState(undefined)

  /* One-per-session splash */
  const [splashDone, setSplashDone] = useState(
    () => !!sessionStorage.getItem('arete_splash_shown')
  )

  useEffect(() => {
    /* Get current session on mount */
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null))

    /* Listen for auth state changes (sign in / sign out) */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /* Checking auth state */
  if (session === undefined) return <AuthLoader />

  /* Not authenticated → login page */
  if (!session) return <LoginPage />

  /* Authenticated */
  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {!splashDone ? (
          <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />
        ) : (
          <AppInner key="app" />
        )}
      </AnimatePresence>
    </AppProvider>
  )
}
