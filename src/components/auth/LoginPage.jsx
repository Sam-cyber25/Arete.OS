import { useState } from 'react'
import { motion }   from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [tab,      setTab]      = useState('signin')   // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [confirm,  setConfirm]  = useState(false)      // email confirmation pending

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    if (tab === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (err) setError(err.message)
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password })
      if (err) {
        setError(err.message)
      } else if (!data.session) {
        /* Email confirmation required */
        setConfirm(true)
      }
      /* If session exists, onAuthStateChange in App.jsx handles routing */
    }
    setLoading(false)
  }

  if (confirm) {
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
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p className="font-cormorant italic" style={{ fontSize: '26px', color: 'var(--text)', marginBottom: 12 }}>
            Check your email
          </p>
          <p className="font-garamond" style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7 }}>
            A confirmation link has been sent to <strong>{email}</strong>.
            Open it to complete your account creation.
          </p>
          <button
            onClick={() => { setConfirm(false); setTab('signin') }}
            className="btn-ghost"
            style={{ fontSize: '10px', marginTop: 24 }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight:      '100vh',
        background:     '#0C0A08',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '24px 16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width:      '100%',
          maxWidth:   400,
          background: '#13110E',
          border:     '1px solid #2A2520',
          padding:    48,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p
            className="font-cinzel"
            style={{ fontSize: '24px', color: 'var(--gold)', letterSpacing: '0.3em', fontWeight: 600, marginBottom: 6 }}
          >
            ARÊTE
          </p>
          <p
            className="font-cinzel uppercase"
            style={{ fontSize: '8px', color: 'var(--faint)', letterSpacing: '0.28em' }}
          >
            Move With Consistency
          </p>
          {/* Ornamental divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#2A2520' }} />
            <span style={{ color: 'var(--gold)', fontSize: '8px', opacity: 0.5 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: '#2A2520' }} />
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-6"
          style={{ borderBottom: '1px solid var(--divider)', marginBottom: 32 }}
        >
          {['signin', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="font-cinzel uppercase"
              style={{
                fontSize:      '10px',
                letterSpacing: '0.2em',
                color:         tab === t ? 'var(--gold)' : 'var(--muted)',
                paddingBottom: 12,
                borderBottom:  tab === t ? '1px solid var(--gold)' : '1px solid transparent',
                transition:    'color 0.15s, border-color 0.15s',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-underline font-garamond"
              style={{ fontSize: '16px' }}
              autoFocus
              required
            />
          </div>

          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-underline font-garamond"
              style={{ fontSize: '16px' }}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="font-garamond italic"
              style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: 1.5 }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width:         '100%',
              height:        48,
              background:    loading ? 'rgba(201,168,76,0.08)' : 'transparent',
              border:        '1px solid var(--gold)',
              color:         'var(--gold)',
              fontFamily:    'Cinzel, serif',
              fontSize:      '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor:        loading ? 'not-allowed' : 'pointer',
              transition:    'background 0.2s, color 0.2s',
              marginTop:     4,
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#0C0A08' } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
          >
            {loading ? '—' : tab === 'signin' ? 'Enter' : 'Create Account'}
          </button>
        </form>

        {/* Tagline */}
        <p
          className="font-garamond italic"
          style={{ fontSize: '13px', color: 'var(--faint)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}
        >
          Your personal command center awaits.
        </p>
      </motion.div>
    </div>
  )
}
