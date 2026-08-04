import { useEffect, useRef, useState } from 'react'
import './EmployeeAccessSettings.css'

const createEmployeeCode = () => Array.from(crypto.getRandomValues(new Uint32Array(10)), value => value % 10).join('')

export default function EmployeeAccessSettings({ savedCode, onSave }) {
  const [code, setCode] = useState(() => savedCode || createEmployeeCode())
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (!savedCode && !initialized.current) {
      initialized.current = true
      onSave({ employeeCode: code }).catch(error => { initialized.current = false; setMessage(error.message) })
    }
  }, [code, onSave, savedCode])

  useEffect(() => {
    if (savedCode) setCode(String(savedCode))
  }, [savedCode])

  const regenerate = async () => {
    const nextCode = createEmployeeCode()
    setBusy(true)
    setMessage('Saving new employee code…')
    try {
      await onSave({ employeeCode: nextCode })
      setCode(nextCode)
      localStorage.removeItem('lane-club-employee-code')
      setMessage('A new employee login code has been saved. The previous code no longer works.')
    } catch (error) {
      setMessage(`The new code was not saved: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setMessage('Employee login code copied.')
  }

  return <article className="employee-access-settings">
    <h2>Employee login</h2>
    <p>Give this 10-digit code only to employees who should access reservations, walk-in sales, and the store.</p>
    <strong className="employee-code">{code}</strong>
    <div className="employee-code-actions">
      <button type="button" onClick={copyCode}>Copy code</button>
      <button type="button" onClick={regenerate} disabled={busy}>{busy ? 'Saving…' : 'Create new code'}</button>
    </div>
    {message && <small>{message}</small>}
  </article>
}
