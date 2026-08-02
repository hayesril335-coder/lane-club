import { useMemo, useState } from 'react'
import './ReservationManagementPage.css'

const hours = Array.from({ length: 24 }, (_, hour) => hour)
const pad = value => String(value).padStart(2, '0')
const localDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const formatHour = hour => `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`
const parseHour = reservation => {
  if (reservation.startsAt) return new Date(reservation.startsAt).getHours()
  const match = String(reservation.time || '').match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)?/i)
  if (!match) return 0
  let hour = Number(match[1]) % 12
  if (match[2]?.toUpperCase() === 'PM') hour += 12
  return hour
}
const duration = reservation => Number.parseFloat(reservation.durationHours ?? reservation.hours ?? reservation.duration ?? 1) || 1
const reservationDate = reservation => reservation.date || (reservation.createdAt ? localDate(new Date(reservation.createdAt)) : localDate(new Date()))

export default function ReservationManagementPage({ bookings = [], alley }) {
  const [selectedDate, setSelectedDate] = useState(() => localDate(new Date()))
  const [selectedHour, setSelectedHour] = useState(() => new Date().getHours())
  const [selected, setSelected] = useState(null)
  const laneCount = Math.max(1, Number(alley?.lanes) || 16)
  const dayBookings = useMemo(() => bookings.filter(item => reservationDate(item) === selectedDate), [bookings, selectedDate])
  const lanes = Array.from({ length: laneCount }, (_, index) => `Lane ${pad(index + 1)}`)
  const reservationsAtHour = lane => dayBookings.filter(item => item.lane === lane && selectedHour >= parseHour(item) && selectedHour < parseHour(item) + duration(item))

  return <main className="reservations-page"><section className="reservations-content">
    <header className="reservations-header"><div><p>RESERVATION SCHEDULE</p><h1>See every <em>lane.</em></h1><span>Select an hour, then choose a highlighted lane to view the customer’s details.</span></div></header>
    <div className="schedule-controls"><label>Date<input type="date" value={selectedDate} onChange={event => { setSelectedDate(event.target.value); setSelected(null) }} /></label><strong>{dayBookings.length} reservation{dayBookings.length === 1 ? '' : 's'} on this day</strong></div>
    <div className="hour-strip" aria-label="Hours of the day">{hours.map(hour => <button key={hour} className={selectedHour === hour ? 'active' : ''} onClick={() => { setSelectedHour(hour); setSelected(null) }}>{formatHour(hour)}</button>)}</div>
    <section className="lane-hour-card"><div className="lane-hour-heading"><div><p>SELECTED TIME</p><h2>{formatHour(selectedHour)}</h2></div><div className="lane-key"><span><b className="available" /> Available</span><span><b className="reserved" /> Reserved</span></div></div>
      <div className="lane-hour-grid">{lanes.map(lane => {
        const matches = reservationsAtHour(lane)
        const booking = matches[0]
        return <button key={lane} className={booking ? 'reserved' : 'available'} onClick={() => booking && setSelected(booking)} aria-label={`${lane}, ${booking ? `reserved by ${booking.name}` : 'available'}`}><strong>{lane}</strong><span>{booking ? booking.name : 'Available'}</span></button>
      })}</div>
    </section>
  </section>{selected && <div className="booking-backdrop" onClick={() => setSelected(null)}><aside className="booking-drawer" onClick={event => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelected(null)}>×</button><p>RESERVATION DETAILS</p><h2>{selected.name}</h2><div className="booking-person"><i>{selected.initials || String(selected.name || '?').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</i><span>{selected.phone || selected.email || 'No contact details provided'}</span></div><div className="booking-time"><strong>{selected.time || formatHour(parseHour(selected))}</strong><span>{selected.lane} · {duration(selected)} hour{duration(selected) === 1 ? '' : 's'}</span></div><dl className="booking-details"><div><dt>Payment</dt><dd>{selected.paymentMethod === 'card' ? 'Card / POS' : 'Cash in person'}</dd></div><div><dt>Amount</dt><dd>${Number(selected.amount || 0).toFixed(2)}</dd></div><div><dt>Status</dt><dd>{selected.status || 'Confirmed'}</dd></div></dl></aside></div>}</main>
}
