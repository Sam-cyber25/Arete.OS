import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* ── Schedule localStorage migration ──────────────────────────
 * Delete legacy keys so stale events don't bleed into v3.
 * Safe to call every load — removeItem is a no-op for missing keys.
 */
;['arete_schedule_events', 'arete_schedule_v1', 'arete_schedule_v2'].forEach((k) =>
  localStorage.removeItem(k),
)

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
