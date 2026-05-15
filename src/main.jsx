import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* ── Nuclear schedule reset (runs once per version) ───────────
 * Deletes ALL keys containing 'schedule' from localStorage.
 * The version sentinel prevents re-running on subsequent loads.
 */
const SCHEDULE_VERSION    = 'v4'
const scheduleVersionKey  = 'arete_schedule_version'
if (localStorage.getItem(scheduleVersionKey) !== SCHEDULE_VERSION) {
  Object.keys(localStorage)
    .filter((k) => k.toLowerCase().includes('schedule'))
    .forEach((k) => localStorage.removeItem(k))
  localStorage.setItem(scheduleVersionKey, SCHEDULE_VERSION)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

/* ── Service Worker registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err))
  })
}
