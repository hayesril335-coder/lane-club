import { useState } from 'react'
import { signIn, signInWithGoogle, signUp } from '../services/authService'
import { isBackendConfigured } from '../lib/supabaseClient'
import './MemberAuthPage.css'

export default function MemberAuthPage({ onBack, onOwner, onContinue }) {
  const [mode, setMode] = useState('signup')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const switchMode = (nextMode) => { setMode(nextMode); setMessage('') }
  const submit = async (event) => {
    event.preventDefault(); setMessage('')
    if (!isBackendConfigured) { onContinue(); return }
    const form = new FormData(event.currentTarget)
    setIsSubmitting(true)
    const payload = { email: form.get('email'), password: form.get('password') }
    const result = mode === 'signup' ? await signUp({ ...payload, fullName: form.get('fullName'), role: 'member' }) : await signIn(payload)
    setIsSubmitting(false)
    if (result.error) { setMessage(result.error.message); return }
    if (mode === 'signup' && !result.data.session) { setMessage('Check your email to confirm your account, then log in.'); return }
    onContinue()
  }
  const google = async () => {
    setMessage('')
    if (!isBackendConfigured) { onContinue(); return }
    setIsSubmitting(true)
    const result = await signInWithGoogle()
    setIsSubmitting(false)
    if (result.error) setMessage(result.error.message)
  }
  return <main className="auth-page"><section className="auth-intro"><button className="back-button" onClick={onBack}>Back to Lane Club</button><a className="brand auth-brand" href="#top" onClick={(e) => { e.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><div className="auth-intro-copy"><p className="eyebrow">MEMBERSHIP MADE SIMPLE</p><h1>Your next game is<br /><em>waiting.</em></h1><p>Join your neighborhood bowling alley and reserve up to four hours of lane time every week.</p><div className="auth-rule"><span>4</span><p><strong>hours every week</strong><br />Book them together or split them up.</p></div></div><p className="auth-quote">A bowling membership that fits my schedule. <b>Member since 2025</b></p></section><section className="auth-panel" id="top"><div className="auth-form-wrap"><div className="auth-tabs" role="tablist"><button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button><button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Log in</button></div><div className="form-heading"><p className="eyebrow">{mode === 'signup' ? 'START BOWLING' : 'WELCOME BACK'}</p><h2>{mode === 'signup' ? 'Create your account.' : 'Log in to Lane Club.'}</h2><p>{mode === 'signup' ? 'It only takes a minute. You will pick your bowling alley next.' : 'Pick up right where you left off.'}</p></div><form onSubmit={submit} className="auth-form">{mode === 'signup' && <label>Full name<input name="fullName" type="text" placeholder="Your full name" autoComplete="name" required /></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength="8" required /></label>{mode === 'login' && <button type="button" className="forgot">Forgot password?</button>}<button type="submit" className="form-submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'} <span>→</span></button></form>{message && <p className="form-message">{message}</p>}<div className="form-divider"><span>OR</span></div><button className="google-button" type="button" onClick={google} disabled={isSubmitting}><b>G</b> Continue with Google</button><p className="terms">By continuing, you agree to Lane Club's <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p><p className="owner-link">Own a bowling alley? <button onClick={onOwner}>Set up your alley →</button></p></div></section></main>
}
