import { useState } from 'react'
import Brand from '../components/Brand'
import { findAlleyByEmployeeCode } from '../services/accountService'
import './EmployeeLoginPage.css'

export default function EmployeeLoginPage({ onBack, onContinue }) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const alley = await findAlleyByEmployeeCode(code)
      if (!alley) throw new Error('That employee code was not recognized.')
      onContinue(alley)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="employee-login-page">
    <section>
      <button className="employee-login-back" onClick={onBack}>← Back</button>
      <Brand />
      <p className="employee-login-eyebrow">EMPLOYEE ACCESS</p>
      <h1>Log in to your <em>alley.</em></h1>
      <p>Enter the 10-digit code provided by your bowling alley owner.</p>
      <form onSubmit={submit}>
        <label>Employee login code<input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" pattern="\d{10}" maxLength="10" placeholder="0000000000" required /></label>
        <button disabled={busy || code.length !== 10}>{busy ? 'Checking code…' : 'Continue →'}</button>
      </form>
      {message && <p className="employee-login-message">{message}</p>}
    </section>
  </main>
}
