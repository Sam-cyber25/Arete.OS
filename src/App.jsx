import { lazy, Suspense, useEffect, useCallback } from 'react'
import { AnimatePresence }                         from 'framer-motion'
import { AppProvider, useApp }                     from './context/AppContext'
import Layout                                      from './components/layout/Layout'
import Toast                                       from './components/layout/Toast'

// Lazy-loaded pages
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const GoalsPage      = lazy(() => import('./pages/GoalsPage'))
const MemoryPage     = lazy(() => import('./pages/MemoryPage'))
const AnalyticsPage  = lazy(() => import('./pages/AnalyticsPage'))
const SchedulePage   = lazy(() => import('./pages/SchedulePage'))
const JournalPage    = lazy(() => import('./pages/JournalPage'))
const PlannerPage    = lazy(() => import('./pages/PlannerPage'))
const WhiteboardPage = lazy(() => import('./pages/WhiteboardPage'))
const StickyNotesPage= lazy(() => import('./pages/StickyNotesPage'))
const SettingsPage   = lazy(() => import('./pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <span className="font-mono" style={{ fontSize: '18px', color: 'var(--gold)' }}>—</span>
    </div>
  )
}

const PAGES = {
  dashboard:   Dashboard,
  goals:       GoalsPage,
  memory:      MemoryPage,
  analytics:   AnalyticsPage,
  schedule:    SchedulePage,
  journal:     JournalPage,
  planner:     PlannerPage,
  whiteboard:  WhiteboardPage,
  stickynotes: StickyNotesPage,
  settings:    SettingsPage,
}

function AppInner() {
  const { currentPage, setCurrentPage, toasts, dismissToast } = useApp()

  const handleKeyDown = useCallback(
    (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod   = isMac ? e.metaKey : e.ctrlKey
      if (mod && e.key === 'k') { e.preventDefault(); setCurrentPage('goals')      }
      if (mod && e.key === 'n') { e.preventDefault(); setCurrentPage('memory')     }
      if (mod && e.key === 'j') { e.preventDefault(); setCurrentPage('journal')    }
      if (mod && e.key === 'w') { e.preventDefault(); setCurrentPage('whiteboard') }
      if (mod && e.key === 'p') { e.preventDefault(); setCurrentPage('planner')    }
    },
    [setCurrentPage]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const PageComponent = PAGES[currentPage] || Dashboard

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
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
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
