import { useState } from 'react'
import './AlleyDetailsPage.css'
import './AlleyBanner.css'

export default function AlleyDetailsPage({ alley, onBack, onJoin }) {
  const [saved, setSaved] = useState(false)
  const mapsQuery = alley.address || `${alley.name}, ${alley.area}, Los Angeles, CA`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
  const titleParts = alley.name.replace(/ (Lanes|Bowl|Room|Social)$/, '')
  const titleSuffix = alley.name.match(/(Lanes|Bowl|Room|Social)$/)?.[0] || ''

  return <main className="details-page">
    <header className="details-header"><a className="brand finder-brand" href="#dashboard" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><nav><button className="nav-active" onClick={onBack}>Find an alley</button><button>My reservations</button><button>Account</button></nav></header>
    <div className="details-shell">
      <button className="details-back" onClick={onBack}>← Back to my dashboard</button>
      <section className={`details-photo ${alley.color} ${alley.bannerImage ? 'has-banner' : ''}`}>
        <button onClick={() => setSaved(!saved)}>{saved ? '♥ Saved' : '♡ Save alley'}</button>
        {alley.bannerImage ? <img className="details-banner-image" src={alley.bannerImage} alt={`${alley.name} bowling alley`} /> : <><div className="photo-pins">● ● ●</div><div className="photo-lanes"><i /><i /><i /><i /><i /></div></>}
        <strong>{alley.name.toUpperCase()}</strong>
      </section>
      <section className="details-layout">
        <article>
          <div className="details-title"><div><p>LOS ANGELES · {alley.area.toUpperCase()}</p><h1>{titleParts} <em>{titleSuffix}</em></h1><span>★ {alley.rating} ({alley.reviews} reviews) · {alley.distance} mi away</span></div><button onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}>Get directions ↗</button></div>
          <div className="details-tags"><b>{alley.lanes} lanes</b>{alley.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <hr />
          <section className="details-about"><h2>Make this your<br /><em>weekly lane.</em></h2><p>{alley.name} gives members the freedom to choose a lane, reserve ahead, and bowl on their own schedule.</p><div className="details-stats"><div><strong>{alley.lanes}</strong><span>bookable lanes</span></div><div><strong>11 AM – 11 PM</strong><span>weekday hours</span></div><div><strong>12 AM</strong><span>Friday & Saturday</span></div></div></section>
        </article>
        <aside className="membership-box"><p>MONTHLY MEMBERSHIP</p><h2>Bowl more.<br /><em>Plan less.</em></h2><div className="membership-price"><strong>${alley.price}</strong><span>per month</span></div><ul><li>✓ Up to 4 reservation hours every week</li><li>✓ Split your hours any way you like</li><li>✓ Pick your preferred lane</li><li>✓ Reserve up to 7 days ahead</li></ul><button onClick={onJoin}>Start membership <span>→</span></button><small>Cancel anytime. No long-term commitment.</small></aside>
      </section>
    </div>
  </main>
}
