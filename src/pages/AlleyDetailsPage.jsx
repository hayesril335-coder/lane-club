import { businessDays, currentBusinessDay, formatDayHours, normalizeBusinessHours } from '../utils/businessHours'
import './AlleyDetailsPage.css'
import './AlleyBanner.css'
import './AlleyDetailsLeagues.css'
import './AlleyHours.css'

export default function AlleyDetailsPage({ alley, onBack, onJoin, onJoinLeague }) {
  const mapsQuery = alley.address || `${alley.name}, ${alley.area}, Los Angeles, CA`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
  const titleParts = alley.name.replace(/ (Lanes|Bowl|Room|Social)$/, '')
  const titleSuffix = alley.name.match(/(Lanes|Bowl|Room|Social)$/)?.[0] || ''
  const businessHours = normalizeBusinessHours(alley)
  const today = currentBusinessDay()

  return <main className="details-page">
    <header className="details-header"><a className="brand finder-brand" href="#dashboard" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><nav><button className="nav-active" onClick={onBack}>Find an alley</button><button>My reservations</button><button>Account</button></nav></header>
    <div className="details-shell">
      <button className="details-back" onClick={onBack}>← Back to my dashboard</button>
      <section className={`details-photo ${alley.color} ${alley.bannerImage ? 'has-banner' : ''}`}>
        {alley.bannerImage ? <img className="details-banner-image" src={alley.bannerImage} alt={`${alley.name} bowling alley`} /> : <><div className="photo-pins">● ● ●</div><div className="photo-lanes"><i /><i /><i /><i /><i /></div></>}
        <strong>{alley.name.toUpperCase()}</strong>
      </section>
      <section className="details-layout">
        <article>
          <div className="details-title"><div><p>LOS ANGELES · {alley.area.toUpperCase()}</p><h1>{titleParts} <em>{titleSuffix}</em></h1><span>★ {alley.rating} ({alley.reviews} reviews) · {alley.distance} mi away</span></div><button onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}>Get directions ↗</button></div>
          <div className="details-tags"><b>{alley.lanes} lanes</b>{alley.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <hr />
          <section className="details-about"><h2>Make this your<br /><em>weekly lane.</em></h2><p>{alley.name} gives members the freedom to choose a lane, reserve ahead, and bowl on their own schedule.</p><div className="details-stats"><div><strong>{alley.lanes}</strong><span>bookable lanes</span></div><div><strong>{formatDayHours(businessHours[today])}</strong><span>hours today</span></div><div><strong>{businessDays.filter(([day]) => !businessHours[day].closed).length} days</strong><span>open each week</span></div></div><section className="details-hours"><p>BUSINESS HOURS</p><div className="details-hours-grid">{businessDays.map(([day, label]) => <div className={day === today ? 'today' : ''} key={day}><span>{label}{day === today ? ' · Today' : ''}</span><strong>{formatDayHours(businessHours[day])}</strong></div>)}</div></section></section>
        </article>
        <div className="details-membership-column">
          <aside className="membership-box"><p>MONTHLY MEMBERSHIP</p><h2>Bowl more.<br /><em>Plan less.</em></h2><div className="membership-price"><strong>${alley.price}</strong><span>per month</span></div><ul><li>✓ Up to 4 reservation hours every week</li><li>✓ Split your hours any way you like</li><li>✓ Pick your preferred lane</li><li>✓ Reserve up to 7 days ahead</li></ul><button onClick={onJoin}>Start membership <span>→</span></button><small>Cancel anytime. No long-term commitment.</small></aside>
          {(alley.leagues || []).length > 0 && <section className="details-league-list">
            <p>LEAGUES AT {alley.name.toUpperCase()}</p>
            <h2>Join an alley league.</h2>
            {alley.leagues.map(league => <article key={league.id}>
              <div><strong>{league.name}</strong><span>${Number(league.monthlyPrice || 0).toFixed(2)}/month</span></div>
              <button type="button" onClick={() => onJoinLeague?.(league)}>Join league</button>
            </article>)}
          </section>}
        </div>
      </section>
    </div>
  </main>
}
