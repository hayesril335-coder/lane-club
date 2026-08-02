import { useState } from 'react'
import { localDate, reservationEndsAt } from '../utils/reservations'
import './OwnerWalkInReservationPage.css'
import './OwnerWalkInReservationExtras.css'

export default function OwnerWalkInReservationPage({ alley, onComplete, onLeagueSignup }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amount, setAmount] = useState('32.00')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const guestName = String(form.get('guestName')).trim()
    const reservation = { id: crypto.randomUUID(), date: String(form.get('date')), time: String(form.get('time')), lane: String(form.get('lane')), name: guestName, phone: String(form.get('phone') || ''), initials: guestName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(), hours: String(form.get('duration')), durationHours: Number.parseFloat(String(form.get('duration'))), status: 'Confirmed', source: 'walk-in', paymentMethod, amount: Number(amount) }
    const end = reservationEndsAt(reservation)
    setSaving(true)
    setMessage('Saving reservation…')
    try {
      await onComplete({ ...reservation, endsAt: end?.toISOString() })
    } catch (error) {
      setMessage(`Reservation was not saved: ${error.message}`)
      setSaving(false)
    }
  }
  const times = Array.from({ length: 24 }, (_, hour) => `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`)
  return <main className="walkin-page"><section><p>WALK-IN RESERVATION</p><h1>Book a <em>walk-in.</em></h1><span>Owner-created reservations have no membership-hour limit.</span><form onSubmit={submit}><div className="walkin-grid"><label>Guest name<input name="guestName" required placeholder="Guest name" /></label><label>Phone number<input name="phone" type="tel" placeholder="(555) 555-5555" /></label><label>Reservation date<input name="date" type="date" min={localDate(new Date())} required defaultValue={localDate(new Date())} /></label><label>Lane<select name="lane" defaultValue="Lane 01">{Array.from({ length: Number(alley?.lanes) || 16 }, (_, index) => <option key={index}>Lane {String(index + 1).padStart(2, '0')}</option>)}</select></label><label>Start time<select name="time" defaultValue="5:00 PM">{times.map(time => <option key={time}>{time}</option>)}</select></label><label>Duration<select name="duration" defaultValue="2 hours"><option>1 hour</option><option>1.5 hours</option><option>2 hours</option><option>3 hours</option><option>4 hours</option></select></label><label>Charge amount<input type="number" min="0" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} /></label></div><fieldset><legend>Payment method</legend><label><input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash — collect in person</label><label><input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card — swipe or tap at the counter</label></fieldset>{paymentMethod === 'card' && <div className="card-notice">Card collection is ready for a Stripe Terminal connection. A real charge will be enabled after the alley connects its Stripe account and terminal reader.</div>}<button className="walkin-submit" disabled={saving}>{saving ? 'Saving reservation…' : paymentMethod === 'cash' ? 'Save cash reservation →' : 'Continue to card reader →'}</button>{message && <p className="walkin-success">{message}</p>}</form><button className="league-signup-button" onClick={onLeagueSignup}>Sign up for league →</button></section></main>
}
