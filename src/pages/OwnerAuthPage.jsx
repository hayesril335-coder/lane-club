import { useCallback, useState } from 'react'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { signIn, signInWithGoogleCredential, signUp } from '../services/authService'
import './OwnerAuthPage.css'

export default function OwnerAuthPage({ onBack, onContinue }) {
  const [mode, setMode] = useState('signup')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const finish = async (action, alleyName = '') => {
    setBusy(true)
    setMessage('')
    try {
      const result = await action()
      await onContinue({ user: result.user, alleyName })
    } catch (error) {
      setMessage(error.message.replace('Firebase: ', ''))
    } finally {
      setBusy(false)
    }
  }

  const submit = event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = { email: form.get('email'), password: form.get('password'), fullName: form.get('fullName') || '' }
    finish(() => mode === 'signup' ? signUp({ ...values, role: 'owner' }) : signIn(values), form.get('alleyName') || '')
  }

  const googleCredential = useCallback(idToken => finish(() => signInWithGoogleCredential(idToken, 'owner')), [])
  const googleError = useCallback(error => setMessage(error.message), [])

  return <main className="owner-auth-page">
    <section className="owner-form-panel">
      <button className="owner-back" onClick={onBack}>← Back to Lane Club</button>
      <a className="brand owner-brand" href="#home" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <div className="owner-form-wrap">
        <div className="owner-tabs"><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create owner account</button><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button></div>
        <div className="owner-heading"><p className="owner-eyebrow">FOR BOWLING ALLEY OWNERS</p><h1>{mode === 'signup' ? 'Bring your lanes to life.' : 'Welcome back.'}</h1><p>Log in to securely save your alley, members, and reservations.</p></div>
        <GoogleAuthButton disabled={busy} onCredential={googleCredential} onError={googleError} role="owner" />
        <div className="auth-divider">or use email</div>
        <form className="owner-form" onSubmit={submit}>
          {mode === 'signup' && <><label>Your name<input name="fullName" required /></label><label>Bowling alley name<input name="alleyName" required /></label></>}
          <label>Business email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" minLength="8" required /></label>
          <button className="owner-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Start setting up →' : 'Log in to dashboard →'}</button>
        </form>
        {message && <p className="owner-message">{message}</p>}
      </div>
    </section>
    <aside className="owner-showcase"><div className="showcase-copy"><h2>More games.<br /><em>More regulars.</em></h2><p>Give members the confidence to make bowling part of their weekly routine.</p></div><div className="owner-price"><span>ONE SIMPLE PLAN</span><strong>$1,000 <small>/ MONTH</small></strong></div></aside>
  </main>
}
