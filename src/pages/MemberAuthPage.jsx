import { useCallback, useState } from 'react'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { signIn, signInWithGoogleCredential, signUp } from '../services/authService'
import './MemberAuthPage.css'

export default function MemberAuthPage({ onBack, onOwner, onContinue }) {
  const [mode, setMode] = useState('signup')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const finish = async action => {
    setBusy(true)
    setMessage('')
    try {
      const result = await action()
      await onContinue({ user: result.user, fullName: result.user.displayName, email: result.user.email })
    } catch (error) {
      setMessage(error.code === 'auth/email-already-in-use' ? 'This account already exists. Please log in.' : error.message.replace('Firebase: ', ''))
    } finally {
      setBusy(false)
    }
  }

  const submit = event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = { email: String(form.get('email')).toLowerCase(), password: String(form.get('password')), fullName: String(form.get('fullName') || '') }
    finish(() => mode === 'signup' ? signUp({ ...values, role: 'member' }) : signIn(values))
  }

  const googleCredential = useCallback(idToken => finish(() => signInWithGoogleCredential(idToken, 'member')), [])
  const googleError = useCallback(error => setMessage(error.message), [])

  return <main className="auth-page">
    <section className="auth-intro">
      <button className="back-button" onClick={onBack}>Back to Lane Club</button>
      <a className="brand auth-brand" href="#top" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <div className="auth-intro-copy"><p className="eyebrow">MEMBERSHIP MADE SIMPLE</p><h1>Your next game is<br /><em>waiting.</em></h1><p>Log in to save your reservations and settings.</p></div>
    </section>
    <section className="auth-panel"><div className="auth-form-wrap">
      <div className="auth-tabs"><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button></div>
      <div className="form-heading"><p className="eyebrow">{mode === 'signup' ? 'START BOWLING' : 'WELCOME BACK'}</p><h2>{mode === 'signup' ? 'Create your account.' : 'Log in to Lane Club.'}</h2></div>
      <GoogleAuthButton disabled={busy} onCredential={googleCredential} onError={googleError} role="member" />
      <div className="auth-divider">or use email</div>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Full name<input name="fullName" required /></label>}
        <label>Email address<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength="8" required /></label>
        <button disabled={busy} className="form-submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account →' : 'Log in →'}</button>
      </form>
      {message && <p className="form-message">{message}</p>}
      <p className="terms">Testing mode is active: no membership payment is required.</p>
      <p className="owner-link">Own a bowling alley? <button onClick={onOwner}>Set up your alley →</button></p>
    </div></section>
  </main>
}
