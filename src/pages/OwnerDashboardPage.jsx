import './OwnerDashboardPage.css'
import './OwnerLeagueMetrics.css'
import './OwnerDashboardSpacing.css'
import './OwnerLeagueButtons.css'
import { localDate, reservationDate } from '../utils/reservations'
import { activeLeagueMembers } from '../utils/leagues'

const durationHours = reservation => Number.parseFloat(reservation.durationHours ?? reservation.hours ?? reservation.duration ?? 0) || 0

export default function OwnerDashboardPage({ alley, reservations = [], now = new Date(), onLeague }) {
  const monthReservations = reservations.filter(reservation => {
    const date = new Date(reservation.createdAt || reservation.date)
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const activeMembers = (alley?.members || []).filter(member => member.active !== false).length
  const leagues = alley?.leagues || []
  const leagueRevenue = leagues.reduce((total, league) => total + (activeLeagueMembers(league).length * Number(league.monthlyPrice || 0)), 0)
  const walkInRevenue = monthReservations.reduce((total, item) => total + (Number(item.amount) || 0), 0)
  const revenue = (activeMembers * (Number(alley?.price) || 0)) + leagueRevenue + walkInRevenue
  const usedHours = monthReservations.reduce((total, item) => total + durationHours(item), 0)
  const memberHours = monthReservations.filter(item => item.source === 'member').reduce((total, item) => total + durationHours(item), 0)
  const laneCount = Math.max(1, Number(alley?.lanes) || 1)
  const todayReservations = reservations.filter(item => reservationDate(item) === localDate(now))
  const todayUsedHours = todayReservations.reduce((total, item) => total + durationHours(item), 0)
  const dailyCapacity = laneCount * 24
  const availableToday = Math.max(0, dailyCapacity - todayUsedHours)
  const utilization = Math.min(100, Math.round((todayUsedHours / dailyCapacity) * 100))
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysUntilReset = Math.max(1, Math.ceil((resetDate - now) / 86400000))

  return <main className="dashboard-page"><section className="dash-content">
    <header className="dash-header"><div><p>OWNER OVERVIEW</p><h1>{alley?.name || 'Your bowling alley'} <em>at a glance.</em></h1><span className="metric-reset">Live totals for this month · reset in {daysUntilReset} day{daysUntilReset === 1 ? '' : 's'}</span></div></header>
    <div className="metric-grid">
      <article><p>ACTIVE MEMBERS</p><strong>{activeMembers}</strong><small>Saved active memberships for this alley</small></article>
      <article><p>MONTHLY REVENUE</p><strong>${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small>Membership and league revenue plus recorded reservation sales</small></article>
      <article><p>LANE UTILIZATION TODAY</p><strong>{utilization}%</strong><small>{Number(availableToday.toFixed(1))} out of {dailyCapacity.toLocaleString()} lane hours available today</small></article>
      <article><p>MEMBER HOURS USED</p><strong>{Number(memberHours.toFixed(1))} hrs</strong><small>Membership reservation hours this month</small></article>
    </div>
    <section className="league-metrics"><div><p>LEAGUE MEMBERS</p><h2>Memberships by league</h2></div>{leagues.length ? <div className="league-metric-grid">{leagues.map(league => <button type="button" key={league.id} onClick={() => onLeague?.(league.id)}><strong>{activeLeagueMembers(league).length}</strong><span>{league.name}</span><small>${Number(league.monthlyPrice || 0).toFixed(2)}/month · Click to manage</small></button>)}</div> : <p className="no-league-metrics">Create a league in Settings to start tracking league members.</p>}</section>
  </section></main>
}
