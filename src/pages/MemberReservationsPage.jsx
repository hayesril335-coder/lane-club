import './MemberReservationsPage.css'

const reservationParts = reservation => {
  if (reservation.dateLabel) { const parts = reservation.dateLabel.split(' '); return [parts[0], parts.at(-1)] }
  if (/^\d{4}-\d{2}-\d{2}$/.test(reservation.date || '')) { const date = new Date(`${reservation.date}T12:00:00`); return [date.toLocaleDateString(undefined, { weekday: 'short' }), date.getDate()] }
  return [reservation.date?.split(' ')[0] || 'DATE', reservation.date?.split(' ')[1] || '—']
}

export default function MemberReservationsPage({ alley, member, onDashboard, onReserve, onChangeAlley }) {
  const reservations = member.reservations || []
  const remaining = Math.max(0, 4 - member.usedHours)
  return <main className="member-reservations-page">
    <header><button onClick={onDashboard}>← Dashboard</button><span>LANE CLUB</span><button onClick={onChangeAlley}>Change Alley</button></header>
    <section className="member-reservations-shell"><p>MY RESERVATIONS</p><h1>Your lane <em>schedule.</em></h1><span className="reservations-intro">You have {remaining} of four hours available this week.</span>
      {reservations.length ? <div className="member-booking-list">{reservations.map((reservation, index) => <article key={reservation.id || index}><div className="member-booking-date"><small>{reservationParts(reservation)[0]}</small><strong>{reservationParts(reservation)[1]}</strong></div><div><p>CONFIRMED</p><h2>{alley.name}</h2><span>{reservation.time} · Lane {String(reservation.lane).padStart(2, '0')} · {reservation.duration} {reservation.duration === 1 ? 'hour' : 'hours'}</span></div><button onClick={onReserve}>Book another →</button></article>)}</div> : <div className="member-reservations-empty"><span>◯</span><h2>No reservations yet.</h2><p>Choose your preferred date, time, and lane when you are ready to bowl.</p><button onClick={onReserve}>Make a reservation →</button></div>}
    </section>
  </main>
}
