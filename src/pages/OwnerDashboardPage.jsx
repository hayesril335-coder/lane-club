import './OwnerDashboardPage.css'
import './OwnerLeagueMetrics.css'

const durationHours = reservation => Number.parseFloat(reservation.durationHours ?? reservation.hours ?? reservation.duration ?? 0) || 0

export default function OwnerDashboardPage({ alley, reservations = [], now = new Date() }) {
  const monthReservations = reservations.filter(reservation => {
    const date = new Date(reservation.createdAt || reservation.date)
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const activeMembers = (alley?.members || []).filter(member => member.active !== false).length
  const walkInRevenue = monthReservations.reduce((total, item) => total + (Number(item.amount) || 0), 0)
  const revenue = (activeMembers * (Number(alley?.price) || 0)) + walkInRevenue
  const usedHours = monthReservations.reduce((total, item) => total + durationHours(item), 0)
  const memberHours = monthReservations.filter(item => item.source === 'member').reduce((total, item) => total + durationHours(item), 0)
  const laneCount = Math.max(1, Number(alley?.lanes) || 1)
  const availableHours = laneCount * 12 * Math.max(1, now.getDate())
  const utilization = Math.min(100, Math.round((usedHours / availableHours) * 100))
  const displayedHours = Number(usedHours.toFixed(1))
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysUntilReset = Math.max(1, Math.ceil((resetDate - now) / 86400000))
  const leagues = alley?.leagues || []

  return <main className="dashboard-page"><section className="dash-content">
    <header className="dash-header"><div><p>OWNER OVERVIEW</p><h1>{alley?.name || 'Your bowling alley'} <em>at a glance.</em></h1><span className="metric-reset">Live totals for this month · reset in {daysUntilReset} day{daysUntilReset === 1 ? '' : 's'}</span></div></header>
    <div className="metric-grid">
      <article><p>ACTIVE MEMBERS</p><strong>{activeMembers}</strong><small>Saved active memberships for this alley</small></article>
      <article><p>MONTHLY REVENUE</p><strong>${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small>Membership revenue plus recorded reservation sales</small></article>
      <article><p>LANE UTILIZATION</p><strong>{utilization}%</strong><small>{displayedHours} of {availableHours.toLocaleString()} available lane hours</small></article>
      <article><p>MEMBER HOURS USED</p><strong>{Number(memberHours.toFixed(1))} hrs</strong><small>Membership reservation hours this month</small></article>
    </div>
    <section className="league-metrics"><div><p>LEAGUE MEMBERS</p><h2>Memberships by league</h2></div>{leagues.length ? <div className="league-metric-grid">{leagues.map(league => <article key={league.id}><strong>{(league.members || []).filter(member => member.status !== 'cancelled').length}</strong><span>{league.name}</span><small>${Number(league.monthlyPrice || 0).toFixed(2)}/month</small></article>)}</div> : <p className="no-league-metrics">Create a league in Settings to start tracking league members.</p>}</section>
  </section></main>
}
