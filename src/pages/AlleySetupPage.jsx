import { useState } from 'react'
import './AlleySetupPage.css'

export default function AlleySetupPage({ onBack, onComplete }) {
  const [saved, setSaved] = useState(false)
  const [lanes, setLanes] = useState(16)
  const [price, setPrice] = useState(20)
  const submit = (event) => { event.preventDefault(); setSaved(true); onComplete() }

  return <main className="setup-page">
    <header className="setup-header"><a className="brand setup-brand" href="#home" onClick={(e) => { e.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><button onClick={onBack}>← Back to billing</button></header>
    <div className="setup-shell">
      <aside className="setup-side"><p className="setup-eyebrow">LAST STEP</p><h1>Set up your <em>alley.</em></h1><p>Tell members where to find you and how your membership works. You can change all of this later.</p><div className="setup-progress"><div className="progress-line filled" /><div className="progress-line filled" /><div className="progress-line filled" /><span className="complete">✓</span><span className="complete">✓</span><span className="current">3</span><small>Account</small><small>Billing</small><small>Alley setup</small></div><div className="side-tip"><span>✦</span><p><strong>Quick tip</strong><br />Start with the lanes you want members to reserve. You can add staff-only or maintenance lanes later.</p></div></aside>
      <section className="setup-form-area"><form onSubmit={submit} className="setup-form">
        <div className="setup-section-title"><span>01</span><div><h2>About your bowling alley</h2><p>These details appear on your member-facing alley page.</p></div></div>
        <div className="field-grid"><label className="wide">Bowling alley name<input required defaultValue="Sunset Lanes" placeholder="e.g. Sunset Lanes" /></label><label>Phone number<input type="tel" required placeholder="(555) 123-4567" /></label><label>Website <small>optional</small><input type="url" placeholder="https://youralley.com" /></label><label className="wide">Street address<input required placeholder="123 Main Street" autoComplete="street-address" /></label><label>City<input required placeholder="Los Angeles" autoComplete="address-level2" /></label><label>State<input required placeholder="CA" autoComplete="address-level1" /></label></div>
        <div className="setup-section-title second"><span>02</span><div><h2>Your lanes & hours</h2><p>Set the basics for your bookable lanes.</p></div></div>
        <div className="field-grid"><label>Number of lanes<input type="number" min="1" max="100" value={lanes} onChange={(e) => setLanes(e.target.value)} /></label><label>Weekday opening time<select defaultValue="11:00 AM"><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option></select></label><label>Weekday closing time<select defaultValue="11:00 PM"><option>9:00 PM</option><option>10:00 PM</option><option>11:00 PM</option><option>12:00 AM</option></select></label></div>
        <div className="setup-section-title second"><span>03</span><div><h2>Set your member price</h2><p>Members receive up to four hours of reservations each week.</p></div></div>
        <div className="price-setting"><div><span>$</span><input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Monthly membership price" /><small>per member / month</small></div><p>Your members will pay <strong>${price || 0}/month</strong> for up to four total reservation hours each week. They can use those hours in any combination.</p></div>
        <button className="finish-button" type="submit">Finish setup <span>→</span></button>
        {saved && <p className="setup-message">Your alley setup has been saved. The owner dashboard is the next page we’ll connect.</p>}
      </form></section>
    </div>
  </main>
}
