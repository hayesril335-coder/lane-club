import { useState } from 'react'
import './OwnerAuthPage.css'

export default function OwnerAuthPage({ onBack, onContinue }) {
  const [mode, setMode] = useState('signup')
  const [submitted, setSubmitted] = useState(false)
  const submit = (event) => { event.preventDefault(); setSubmitted(true); onContinue() }

  return <main className="owner-auth-page">
    <section className="owner-form-panel">
      <button className="owner-back" onClick={onBack}>← Back to Lane Club</button>
      <a className="brand owner-brand" href="#home" onClick={(e) => { e.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <div className="owner-form-wrap">
        <div className="owner-tabs"><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setSubmitted(false) }}>Create owner account</button><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setSubmitted(false) }}>Log in</button></div>
        <div className="owner-heading"><p className="owner-eyebrow">FOR BOWLING ALLEY OWNERS</p><h1>{mode === 'signup' ? 'Bring your lanes to life.' : 'Welcome back.'}</h1><p>{mode === 'signup' ? 'Set up your alley, welcome members, and turn spare lane time into reliable monthly revenue.' : 'Log in to manage your alley, members, and reservations.'}</p></div>
        <form className="owner-form" onSubmit={submit} noValidate>
          {mode === 'signup' && <><label>Your name<input type="text" placeholder="Full name" autoComplete="name" required /></label><label>Bowling alley name<input type="text" placeholder="e.g. Sunset Lanes" required /></label></>}
          <label>Business email<input type="email" placeholder="you@youralley.com" autoComplete="email" required /></label>
          <label>Password<input type="password" placeholder="At least 8 characters" minLength="8" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
          {mode === 'login' && <button type="button" className="owner-forgot">Forgot password?</button>}
          <button className="owner-submit" type="submit">{mode === 'signup' ? 'Start setting up' : 'Log in to dashboard'} <span>→</span></button>
        </form>
        {submitted && <p className="owner-message">Your account will continue to the $1,000/month owner plan on the next page.</p>}
        {mode === 'signup' && <div className="owner-trust"><span>✓</span><p><strong>No contracts. Cancel anytime.</strong><br />Your subscription begins after you complete your alley setup.</p></div>}
      </div>
    </section>
    <aside className="owner-showcase">
      <div className="showcase-top"><p className="owner-eyebrow">LANE CLUB FOR BUSINESS</p><span>OWNER PLATFORM</span></div>
      <div className="showcase-copy"><h2>More games.<br /><em>More regulars.</em></h2><p>Give members the confidence to make bowling part of their weekly routine.</p></div>
      <div className="dashboard-card"><div className="dash-card-top"><span>YOUR ALLEY</span><b>Sunset Lanes</b></div><div className="dash-metrics"><div><strong>148</strong><span>Active members</span></div><div><strong>82%</strong><span>Lane utilization</span></div></div><div className="dash-chart"><i /><i /><i /><i /><i /><i /><i /></div><small>MEMBER ACTIVITY THIS MONTH</small></div>
      <div className="owner-price"><span>ONE SIMPLE PLAN</span><strong>$1,000 <small>/ MONTH</small></strong><p>Everything you need to run your membership program.</p></div>
    </aside>
  </main>
}
