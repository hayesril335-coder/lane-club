import { useState } from 'react'
import Brand from '../components/Brand'
import './LandingPage.css'

const Arrow = () => <span aria-hidden="true">→</span>

export default function LandingPage({ onNavigate }) {
  const [notice, setNotice] = useState('')

  const showNextStep = (role) => {
    if (role === 'Owner login') {
      onNavigate('owner-auth-login')
      return
    }
    if (role === 'Employee login') {
      onNavigate('employee-login')
      return
    }
    if (role === 'Member login') {
      onNavigate('member-auth-login')
      return
    }
    if (role === 'Member') {
      onNavigate('member-auth')
      return
    }
    if (role === 'Bowling alley owner') {
      onNavigate('owner-auth')
      return
    }
    setNotice(`${role} sign-up is the next page we’ll build. Your choice has been noted.`)
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <Brand href="#top" />
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#for-alleys">For alleys</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">YOUR LANE. ON YOUR TIME.</p>
          <h1>Make every week a <em>bowling</em> week.</h1>
          <p className="hero-text">Join a local alley, reserve the lane you want, and bowl up to four hours every week—all with one simple membership.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => showNextStep('Member')}>Create An Account <Arrow /></button>
            <button className="secondary-button" onClick={() => showNextStep('Member login')}>Login <Arrow /></button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          <div className="member-note"><span>4</span><p><strong>Hours per week</strong><br />Use them any way you want.</p></div>
        </div>

        <div className="lane-visual" aria-label="A bowling ball rolling toward ten pins">
          <img className="lane-photo" src="/images/lane-club-bowling-hero.png" alt="A realistic bowling ball rolling toward ten bowling pins" />
          <div className="score-card"><small>LANE 12</small><strong>YOUR TIME</strong><span>FRI · 7:00 PM</span></div>
        </div>
      </section>

      <section className="steps" id="how-it-works">
        <div className="shell">
          <p className="eyebrow">HOW IT WORKS</p>
          <div className="section-heading"><h2>A better way to <em>bowl.</em></h2><p>One membership. Your favorite local lanes. No guesswork.</p></div>
          <div className="step-grid">
            <article><span>01</span><h3>Choose your alley</h3><p>Browse nearby bowling alleys and find the one that feels like home.</p></article>
            <article><span>02</span><h3>Start membership</h3><p>Join for the monthly price set by your chosen bowling alley.</p></article>
            <article><span>03</span><h3>Reserve & roll</h3><p>Book any combination of reservations totaling up to four hours each week.</p></article>
          </div>
        </div>
      </section>

      <section className="alley-banner shell" id="for-alleys">
        <div><p className="eyebrow">FOR BOWLING ALLEYS</p><h2>Keep lanes busy.<br /><em>Keep bowlers coming back.</em></h2></div>
        <div>
          <p>Offer members a seamless reservation experience and grow dependable monthly revenue.</p>
          <div className="alley-login-actions">
            <button onClick={() => showNextStep('Owner login')}>Owner Login</button>
            <button onClick={() => showNextStep('Employee login')}>Employee Login</button>
          </div>
          <button className="light-button" onClick={() => showNextStep('Bowling alley owner')}>Partner with Lane Club <Arrow /></button>
        </div>
      </section>
    </main>
  )
}
