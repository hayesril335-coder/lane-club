import './MemberReservationsPage.css'

export default function MemberReservationsPage({ alley, member, onDashboard, onReserve }) {
  const reservations = member.reservations || []
  const remaining = Math.max(0, 4 - member.usedHours)
  return <main className="member-reservations-page">
    <header><button onClick={onDashboard}>← Dashboard</button><span>LANE CLUB</span><button onClick={onReserve}>+ Reserve</button></header>
    <section className="member-reservations-shell">
      <p>MY RESERVATIONS</p><h1>Your lane <em>schedule.</em></h1><span className="reservations-intro">You have {remaining} of four hours available this week.</span>
      {reservations.length ? <div className="member-booking-list">{reservations.map((reservation, index) => <article key={reservation.id || index}>
        <div className="member-booking-date"><small>{reservation.date?.split(' ')[0] || 'DATE'}</small><strong>{reservation.date?.split(' ')[1] || '—'}</strong></div>
        <div><p>CONFIRMED</p><h2>{alley.name}</h2><span>{reservation.time} · Lane {String(reservation.lane).padStart(2, '0')} · {reservation.duration} {reservation.duration === 1 ? 'hour' : 'hours'}</span></div>
        <button onClick={onReserve}>Book another →</button>
      </article>)}</div> : <div className="member-reservations-empty"><span>◯</span><h2>No reservations yet.</h2><p>Choose your preferred date, time, and lane when you are ready to bowl.</p><button onClick={onReserve}>Make a reservation →</button></div>}
    </section>
  </main>
}
