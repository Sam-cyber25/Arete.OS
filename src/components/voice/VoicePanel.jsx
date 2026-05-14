import { useState, useEffect, useCallback } from 'react'
import { motion }                            from 'framer-motion'
import { useApp }                            from '../../context/AppContext'
import { useVoice }                          from '../../hooks/useVoice'
import { parseVoiceCommand }                 from '../../utils/voiceCommands'
import TranscriptFeed                        from './TranscriptFeed'

export default function VoicePanel() {
  const { settings, addTask, addNote, setCurrentPage, tasks, showToast } = useApp()
  const [exchanges, setExchanges] = useState([])

  const handleResult = useCallback(
    (transcript, speak) => {
      const result = parseVoiceCommand(transcript, {
        tasks, addTask, addNote, navigate: setCurrentPage, speak,
      })
      setExchanges((prev) =>
        [{ id: Date.now(), input: transcript, response: result.message, timestamp: new Date() }, ...prev].slice(0, 10)
      )
      if (result.type === 'task') showToast('Task added via voice')
      if (result.type === 'note') showToast('Saved to memory')
    },
    [tasks, addTask, addNote, setCurrentPage, showToast]
  )

  const { isSupported, isListening, isSpeaking, interimTranscript, toggleListening } = useVoice({
    onResult: handleResult,
    settings,
  })

  // Spacebar
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggleListening()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleListening])

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <p className="font-cinzel uppercase tracking-widest" style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.22em' }}>
          Voice Unavailable
        </p>
        <p className="font-garamond italic text-center max-w-sm" style={{ color: 'var(--faint)', fontSize: '16px' }}>
          The Web Speech API is not supported in this browser. Use Chrome or Edge.
        </p>
      </div>
    )
  }

  const orbState = isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'

  return (
    <div className="flex flex-col items-center gap-10 py-10">
      {/* State label */}
      <p
        className="font-cinzel uppercase tracking-widest"
        style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: orbState === 'idle' ? 'var(--faint)' : 'var(--gold)',
        }}
      >
        {orbState === 'idle'      && 'Ready'}
        {orbState === 'listening' && 'Listening'}
        {orbState === 'speaking'  && 'Speaking'}
      </p>

      {/* Classical orb — simple geometric circle */}
      <button
        onClick={toggleListening}
        className="relative flex items-center justify-center focus:outline-none"
        style={{ width: 200, height: 200 }}
      >
        {/* Outer static ring */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid var(--border)',
          }}
        />

        {/* Rotating dashed ring when listening */}
        {isListening && (
          <svg
            width="200" height="200" viewBox="0 0 200 200" fill="none"
            className="absolute inset-0"
          >
            <circle
              cx="100" cy="100" r="96"
              stroke="var(--gold)"
              strokeWidth="1"
              strokeDasharray="18 10"
              strokeLinecap="round"
              fill="none"
              className="orb-listening-ring"
              style={{ transformOrigin: '100px 100px' }}
            />
          </svg>
        )}

        {/* Speaking — solid thicker ring */}
        {isSpeaking && (
          <div
            style={{
              position: 'absolute', inset: 4, borderRadius: '50%',
              border: '2px solid var(--gold)',
              opacity: 0.6,
            }}
          />
        )}

        {/* Inner accent ring */}
        <div
          style={{
            position: 'absolute', inset: 28, borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        />

        {/* Center text */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="font-cinzel"
            style={{
              fontSize:      '16px',
              color:         orbState === 'idle' ? 'var(--muted)' : 'var(--gold)',
              letterSpacing: '0.2em',
            }}
          >
            ARÊTE
          </span>
          {orbState === 'listening' && (
            <span className="font-mono" style={{ fontSize: '9px', color: 'var(--faint)' }}>
              &#9632;&#9632;&#9632;
            </span>
          )}
        </div>
      </button>

      {/* Interim transcript */}
      {interimTranscript && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-garamond italic text-center"
          style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: 400 }}
        >
          &ldquo;{interimTranscript}&rdquo;
        </motion.p>
      )}

      {/* Keyboard hint */}
      <p className="font-garamond" style={{ color: 'var(--faint)', fontSize: '13px' }}>
        Press{' '}
        <span
          className="font-mono"
          style={{
            border:        '1px solid var(--border)',
            padding:       '2px 8px',
            fontSize:      '11px',
            color:         'var(--muted)',
          }}
        >
          Space
        </span>{' '}
        to toggle
      </p>

      {/* Commands reference */}
      <div
        className="w-full max-w-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 24 }}
      >
        <p className="section-label" style={{ marginBottom: 16 }}>Commands</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {[
            { cmd: '"add task [text]"',   desc: 'Add a task'         },
            { cmd: '"add note [text]"',   desc: 'Save to memory'     },
            { cmd: '"show schedule"',     desc: 'Open schedule'      },
            { cmd: '"show analytics"',    desc: 'Open analytics'     },
            { cmd: '"how many tasks"',    desc: 'Task count'         },
            { cmd: '"open journal"',      desc: 'Open journal'       },
            { cmd: '"hello" / "salve"',   desc: 'Greeting'           },
            { cmd: '"go home"',           desc: 'Return to overview' },
          ].map((c) => (
            <div key={c.cmd}>
              <p className="font-mono" style={{ fontSize: '11px', color: 'var(--bronze)', marginBottom: 2 }}>
                {c.cmd}
              </p>
              <p className="font-garamond" style={{ fontSize: '13px', color: 'var(--faint)' }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div
        className="w-full max-w-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 24 }}
      >
        <p className="section-label" style={{ marginBottom: 16 }}>Transcript</p>
        <TranscriptFeed exchanges={exchanges} />
      </div>
    </div>
  )
}
