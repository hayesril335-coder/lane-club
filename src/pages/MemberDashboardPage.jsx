import AccountMenu from '../components/AccountMenu'
import './MemberDashboardPage.css'

function untilMonday(now) {
  const monday = new Date(now)
  monday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7))
  monday.setHours(0, 0, 0, 0)
  const seconds = Math.max(0, Math.floor((monday - now) / 1000))
  return `${Math.floor(seconds / 86400)}d ${String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0')}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}m`
}

export default function MemberDashboardPage({ alley, now, onBack, onReserve, onReservations, onAccount, member }) {
  const remaining = Math.max(0, 4 - member.usedHours)
  const reservations = member.reservations || []
  const next = reservations[0]
  return <main className="member-dashboard">
    <header className="member-dash-header">
      <a className="brand finder-brand" href="#dashboard" onClick={event => event.preventDefault()}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <nav><button onClick={onReservations}>My reservations</button><button onClick={onBack}>Find an alley</button><button onClick={onAccount}>Account</button></nav>
      <AccountMenu member={member} onOpenSettings={onAccount} />
    </header>
    <section className="member-dash-shell">
      <header className="member-welcome"><div><p>YOUR MEMBER DASHBOARD</p><h1>Ready to <em>roll,</em> {member.name.split(' ')[0]}?</h1><span>{member.hasMembership ? `Your ${alley.name} membership is active.` : 'Choose an alley to start your membership.'}</span></div><button onClick={onReserve}>+ Make a reservation</button></header>
      <section className="hours-card"><div className="hours-card-top"><div><p>YOUR WEEKLY LANE TIME</p><h2>{remaining} <span>of 4 hours left</span></h2><small>Resets in {untilMonday(now)}</small></div><button onClick={onReserve}>Reserve a lane →</button></div><div className="hours-track">{[1, 2, 3, 4].map(hour => hour <= member.usedHours ? <b key={hour} /> : <i key={hour} />)}</div><div className="hours-labels"><span>Used · {member.usedHours} hours</span><span>Available · {remaining} hours</span></div></section>
      <section className="member-dash-grid">
        <article className="next-reservation"><div className="member-card-heading"><div><p>{next ? 'NEXT RESERVATION' : 'NO UPCOMING BOOKING'}</p><h2>{next ? 'Your next lane' : 'Your lane is waiting'}</h2></div><button onClick={onReservations}>View all →</button></div>{next ? <div className="next-info"><h3>{next.date} · {next.time}</h3><p>{alley.name} · Lane {String(next.lane).padStart(2, '0')} · {next.duration} hours</p></div> : <div className="next-info no-reservation"><h3>Use your remaining lane time</h3><p>You have {remaining} hours ready to reserve this week.</p></div>}<div className="next-actions"><button onClick={onReserve}>{next ? 'Book another reservation' : 'Book now'}</button></div></article>
        <article className="member-alley-card"><div className="member-card-heading"><div><p>YOUR HOME ALLEY</p><h2>{alley.name}</h2></div><button onClick={onBack}>View alley →</button></div><div className="alley-card-graphic"><span>● ● ●</span><i /><i /><i /></div><p>{alley.area} · {alley.distance} mi away</p><div><b>{alley.lanes} lanes</b><span>Open until 11 PM</span></div></article>
      </section>
    </section>
  </main>
}
