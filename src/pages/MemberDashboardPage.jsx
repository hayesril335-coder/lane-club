import AccountMenu from '../components/AccountMenu'
import MembershipAlleyMenu from '../components/MembershipAlleyMenu'
import { newestReservationsFirst, reservationEndsAt, upcomingReservationsFirst } from '../utils/reservations'
import './MemberDashboardPage.css'
import './MemberDashboardReservationFix.css'
import './MemberDashboardHistory.css'

function untilCycleReset(resetAt, now) {
  const seconds = Math.max(0, Math.floor((new Date(resetAt) - now) / 1000))
  return `${Math.floor(seconds / 86400)}d ${String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0')}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}m`
}

const historyDate = reservation => {
  if (reservation.dateLabel) return reservation.dateLabel
  if (/^\d{4}-\d{2}-\d{2}$/.test(reservation.date || '')) return new Date(`${reservation.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return reservation.date || 'Date unavailable'
}

export default function MemberDashboardPage({ alley, membershipAlleys, now, onBack, onSelectAlley, onReserve, onReservations, onAccount, member }) {
  const remaining = Math.max(0, 4 - member.usedHours)
  const reservations = member.reservations || []
  const next = upcomingReservationsFirst(reservations, now)[0]
  const reservationHistory = newestReservationsFirst(reservations)
  return <main className="member-dashboard">
    <header className="member-dash-header">
      <a className="brand finder-brand" href="#dashboard" onClick={event => event.preventDefault()}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <nav><button onClick={onReservations}>My reservations</button><button onClick={onBack}>Find an alley</button><button onClick={onAccount}>Account</button></nav>
      <AccountMenu member={member} onOpenSettings={onAccount} />
    </header>
    <section className="member-dash-shell">
      <header className="member-welcome"><div><p>YOUR MEMBER DASHBOARD</p><h1>Ready to <em>roll,</em> {member.name.split(' ')[0]}?</h1><span>{member.hasMembership ? `Your ${alley.name} membership is active.` : 'Choose an alley to start your membership.'}</span></div><MembershipAlleyMenu alleys={membershipAlleys} currentAlley={alley} onSelect={onSelectAlley} /></header>
      <section className="hours-card"><div className="hours-card-top"><div><p>YOUR 7-DAY LANE TIME</p><h2>{remaining} <span>of 4 hours left</span></h2><small>Resets in {untilCycleReset(member.membershipCycleEnd, now)}</small></div><button onClick={onReserve}>{member.hasMembership ? 'Reserve a lane →' : 'Start membership →'}</button></div><div className="hours-track">{[1, 2, 3, 4].map(hour => hour <= member.usedHours ? <b key={hour} /> : <i key={hour} />)}</div><div className="hours-labels"><span>Used · {member.usedHours} hours</span><span>Available · {remaining} hours</span></div></section>
      <section className="member-dash-grid">
        <article className="next-reservation"><div className="member-card-heading"><div><p>{next ? 'NEXT RESERVATION' : 'NO UPCOMING BOOKING'}</p><h2>{next ? 'Your next lane' : 'Your lane is waiting'}</h2></div><button onClick={onReservations}>View all →</button></div>{next ? <div className="next-info"><h3>{next.dateLabel || next.date} · {next.time}</h3><p>{alley.name} · Lane {String(next.lane).padStart(2, '0')} · {next.duration} hours</p></div> : <div className="next-info no-reservation"><h3>Use your remaining lane time</h3><p>You have {remaining} hours ready to reserve this week.</p></div>}<div className="next-actions"><button onClick={onReserve}>{member.hasMembership ? (next ? 'Book another reservation' : 'Book now') : 'Start membership'}</button></div></article>
        <article className="member-alley-card"><div className="member-card-heading"><div><p>YOUR HOME ALLEY</p><h2>{alley.name}</h2></div><button onClick={onBack}>View alley →</button></div><div className="alley-card-graphic"><span>● ● ●</span><i /><i /><i /></div><p>{alley.area} · {alley.distance} mi away</p><div><b>{alley.lanes} lanes</b><span>Open until 11 PM</span></div></article>
      </section>
      <section className="member-reservation-history">
        <header><div><p>RESERVATION HISTORY</p><h2>Every visit at <em>{alley.name}.</em></h2></div><span>{reservationHistory.length} {reservationHistory.length === 1 ? 'reservation' : 'reservations'}</span></header>
        {reservationHistory.length ? <div>{reservationHistory.map(reservation => {
          const isPast = reservationEndsAt(reservation)?.getTime() < now.getTime()
          return <article key={reservation.id || `${reservation.date}-${reservation.time}-${reservation.lane}`}><div><span>{isPast ? 'COMPLETED' : 'UPCOMING'}</span><strong>{historyDate(reservation)} · {reservation.time}</strong></div><p>Lane {String(reservation.lane).replace(/^Lane\s*/i, '').padStart(2, '0')} · {reservation.duration || reservation.durationHours || 1} {(reservation.duration || reservation.durationHours || 1) === 1 ? 'hour' : 'hours'}</p></article>
        })}</div> : <p className="member-history-empty">Your saved reservations for this alley will appear here.</p>}
      </section>
    </section>
  </main>
}
