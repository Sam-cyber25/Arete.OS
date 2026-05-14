import { useEffect, useState } from 'react'

const TYPE_STYLES = {
  success: { border: 'var(--success)', color: 'var(--success)' },
  error:   { border: 'var(--danger)',  color: 'var(--danger)'  },
  info:    { border: 'var(--bronze)',  color: 'var(--bronze)'  },
}

export default function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)

  const dismiss = () => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 280)
  }

  useEffect(() => {
    const t = setTimeout(dismiss, 2800)
    return () => clearTimeout(t)
  }, [])

  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.success

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-4 px-5 py-3 ${exiting ? 'toast-out' : 'toast-in'}`}
      style={{
        background:  'var(--surface)',
        border:      `1px solid ${style.border}`,
        borderLeft:  `3px solid ${style.border}`,
        borderRadius: '1px',
        minWidth:    220,
      }}
    >
      <span
        className="font-garamond"
        style={{ color: 'var(--text)', fontSize: '15px' }}
      >
        {toast.message}
      </span>
      <button
        onClick={dismiss}
        className="font-cinzel text-xs tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--muted)', fontSize: '9px', letterSpacing: '0.15em' }}
      >
        CLOSE
      </button>
    </div>
  )
}
