import { useState } from 'react'
import { useApp }   from '../../context/AppContext'

function SectionHeading({ children }) {
  return (
    <p
      className="font-cinzel uppercase tracking-widest"
      style={{
        fontSize:      '9px',
        letterSpacing: '0.28em',
        color:         'var(--bronze)',
        marginBottom:  16,
        paddingBottom: 10,
        borderBottom:  '1px solid var(--divider)',
      }}
    >
      {children}
    </p>
  )
}

export default function SettingsPanel() {
  const { settings, updateSettings, exportData, clearAllData, showToast } = useApp()
  const [resetInput, setResetInput] = useState('')

  const handleReset = () => {
    if (resetInput.trim().toUpperCase() === 'RESET') {
      clearAllData()
    } else {
      showToast('Type RESET to confirm', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-12" style={{ maxWidth: 580 }}>

      {/* — Profile — */}
      <div>
        <SectionHeading>Profile</SectionHeading>
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Your Name</p>
          <input
            value={settings.userName || ''}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Your name..."
            className="input-underline font-garamond"
            style={{ fontSize: '16px', maxWidth: 320 }}
          />
        </div>
      </div>

      {/* — Data — */}
      <div>
        <SectionHeading>Data</SectionHeading>
        <div className="flex flex-col gap-6">
          <div>
            <p
              className="font-garamond"
              style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}
            >
              Export all data as a JSON archive — goals, tasks, memory, journal, schedule.
            </p>
            <button className="btn-primary" onClick={exportData}>
              Export Archive
            </button>
          </div>

          <div style={{ paddingTop: 20, borderTop: '1px solid var(--divider)' }}>
            <p
              className="font-garamond"
              style={{ fontSize: '14px', color: 'var(--danger)', marginBottom: 12, lineHeight: 1.6 }}
            >
              Danger — permanently erases all data. Type RESET to unlock.
            </p>
            <div className="flex gap-3">
              <input
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET"
                className="input-box font-mono flex-1"
                style={{ fontSize: '13px', maxWidth: 200 }}
              />
              <button className="btn-danger" onClick={handleReset}>
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* — About — */}
      <div>
        <SectionHeading>About</SectionHeading>
        <p className="font-garamond" style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
          Arête OS — a personal command center for the pursuit of excellence.
          All data stored locally in your browser. Nothing leaves your device.
        </p>
        <p className="font-mono" style={{ fontSize: '10px', color: 'var(--faint)', marginTop: 8 }}>
          v2.0 · arete_
        </p>
      </div>
    </div>
  )
}
