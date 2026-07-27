import { useState } from 'react'
import './OwnerDashboardPage.css'

const reservations = [
  ['6:00 PM', 'Lane 04', 'Maya Thompson', '2 hrs'],
  ['6:30 PM', 'Lane 11', 'James Wilson', '1.5 hrs'],
  ['7:00 PM', 'Lane 02', 'Jordan Lee', '2 hrs'],
  ['7:30 PM', 'Lane 15', 'Alex Morgan', '1 hr'],
]

export default function OwnerDashboardPage({ onBack, onLanes, onReservations }) {
  const [range, setRange] = useState('This month')
  const [notice, setNotice] = useState('')
  return <main className="dashboard-page">
    <aside className="dash-nav"><a className="brand dash-brand" href="#home" onClick={(e) => { e.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><div className="alley-switch"><span>SL</span><div><strong>Sunset Lanes</strong><small>Owner account</small></div><b>⌄</b></div><nav><button className="selected">▦ Overview</button><button onClick={() => setNotice('Member management will be added later.')}>♙ Members <span>148</span></button><button onClick={onReservations}>▤ Reservations</button><button onClick={onLanes}>◫ Lanes</button><button onClick={() => setNotice('Settings will be connected later.')}>⚙ Settings</button></nav><div className="dash-help"><span>?</span><p><strong>Need a hand?</strong><br />Visit the Lane Club help center.</p></div><button className="dash-logout" onClick={onBack}>← Log out</button></aside>
    <section className="dash-content"><header className="dash-header"><div><p>THURSDAY, JUNE 12</p><h1>Good morning, <em>Jamie.</em></h1></div><div className="dash-header-actions"><button className="bell">♧</button><button className="add-reservation" onClick={onReservations}>+ New reservation</button></div></header>
      {notice && <p className="dash-notice">{notice}</p>}
      <div className="metric-grid"><article><p>ACTIVE MEMBERS</p><strong>148</strong><small className="up">↑ 12% <i>vs. last month</i></small><div className="mini-bars"><b /><b /><b /><b /><b /><b /><b /></div></article><article><p>MONTHLY REVENUE</p><strong>$2,960</strong><small className="up">↑ 8.4% <i>vs. last month</i></small><div className="mini-line">╱╲╱╱╲╱</div></article><article><p>LANE UTILIZATION</p><strong>82%</strong><small className="up">↑ 5.2% <i>vs. last month</i></small><div className="util-ring"><b>82%</b></div></article><article><p>MEMBER HOURS USED</p><strong>476 <i>hrs</i></strong><small>of 592 available this month</small><div className="progress-bar"><b /></div></article></div>
      <div className="dash-grid"><article className="revenue-card"><div className="card-title"><div><h2>Revenue overview</h2><p>Membership revenue</p></div><select value={range} onChange={(e) => setRange(e.target.value)}><option>This month</option><option>Last month</option><option>This year</option></select></div><div className="revenue-total"><strong>$2,960</strong><span className="up">↑ 8.4%</span></div><div className="chart"><div className="axis"><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart-bars"><b /><b /><b /><b /><b /><b /><b /><b /><b /><b /><b /><b /></div></div><div className="months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span></div></article>
        <article className="lane-card"><div className="card-title"><div><h2>Lane status</h2><p>Right now · 5:42 PM</p></div><button onClick={onLanes}>View lanes →</button></div><div className="lane-status"><div><b>12</b><span>Available</span></div><div><b>3</b><span>In use</span></div><div><b>1</b><span>Maintenance</span></div></div><div className="lane-map">{Array.from({ length: 16 }, (_, i) => <i key={i} className={i === 5 ? 'repair' : i > 11 ? 'open' : 'busy'}>{String(i + 1).padStart(2, '0')}</i>)}</div><p className="lane-key"><b /> In use <b /> Available <b /> Maintenance</p></article></div>
      <article className="reservation-card"><div className="card-title"><div><h2>Upcoming reservations</h2><p>Today, Thursday June 12</p></div><button onClick={onReservations}>View all reservations →</button></div><div className="reservation-head"><span>TIME</span><span>LANE</span><span>MEMBER</span><span>DURATION</span><span /></div>{reservations.map(([time, lane, person, duration]) => <div className="reservation-row" key={lane}><b>{time}</b><span>{lane}</span><span className="member"><i>{person.split(' ').map(n => n[0]).join('')}</i>{person}</span><span>{duration}</span><button onClick={onReservations}>•••</button></div>)}</article>
    </section>
  </main>
}
