import { useState } from 'react'
import './PasswordResetForm.css'

export default function PasswordResetForm({ emailLabel = 'Email address', onBack, onSubmit, busy, message }) {
  const [email, setEmail] = useState('')

  const submit = event => {
    event.preventDefault()
    onSubmit(email)
  }

  return <section className="password-reset-form" aria-live="polite">
    <p className="password-reset-eyebrow">PASSWORD RESET</p>
    <h2>Reset your password.</h2>
    <p>Enter the email for your Lane Club account. We’ll send a secure link to choose a new password.</p>
    <form onSubmit={submit}>
      <label>{emailLabel}<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
      <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link →'}</button>
    </form>
    {message && <p className="password-reset-message">{message}</p>}
    <button type="button" className="password-reset-back" onClick={onBack}>← Back to log in</button>
  </section>
}
