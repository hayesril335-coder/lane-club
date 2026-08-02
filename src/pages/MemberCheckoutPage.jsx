import { useState } from 'react'
import './MemberCheckoutPage.css'
import './MemberCheckoutTesting.css'

export default function MemberCheckoutPage({ alley, onBack, onComplete }) {
  const [complete, setComplete] = useState(false)
  const initials = alley.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
  const purchase = event => { event.preventDefault(); setComplete(true); onComplete() }
  return <main className="member-checkout-page">
    <header className="member-checkout-header"><a className="brand checkout-brand" href="#back" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><span>Secure checkout</span></header>
    <div className="member-checkout-shell"><section className="member-payment">
      <button className="member-back" onClick={onBack}>← Back to {alley.name}</button><p>MEMBERSHIP CHECKOUT</p><h1>You are almost<br /><em>on the lanes.</em></h1><span className="member-subtitle">Join {alley.name} and make every week a bowling week.</span>
      <div className="member-steps"><b>✓</b><i /><b className="current">2</b><i /><b>3</b><small>Choose alley</small><small>Payment</small><small>Start bowling</small></div>
      <form className="member-payment-form" onSubmit={purchase}><h2>Payment details</h2><span>Use a card to start your monthly membership.</span>
        <label>Cardholder name<input placeholder="Name on card" /></label><label>Card number<input placeholder="1234 1234 1234 1234" inputMode="numeric" /></label>
        <div className="member-card-row"><label>Expiration date<input placeholder="MM / YY" /></label><label>Security code<input placeholder="CVC" inputMode="numeric" /></label></div>
        <label className="member-save-card"><input type="checkbox" defaultChecked /> Save this payment method for monthly billing.</label>
        <small className="checkout-testing-note">Testing mode: card details are optional and no charge will be made.</small>
        <button type="submit">Purchase membership <span>→</span></button>{complete && <div className="member-complete">Your membership is ready.</div>}
      </form>
    </section><aside className="member-order"><p>YOUR MEMBERSHIP</p><div className="order-alley"><span>{initials}</span><div><strong>{alley.name}</strong><small>{alley.area}</small></div></div><h2>Your weekly lane<br /><em>time, secured.</em></h2><div className="order-price"><strong>${alley.price}</strong><span>per month</span></div><div className="hours-callout"><strong>4</strong><p><b>hours every week</b><br />Use them all at once or split them up.</p></div><ul><li>✓ Select your preferred lane</li><li>✓ Reserve up to 7 days ahead</li><li>✓ Change or cancel when needed</li><li>✓ No long-term commitment</li></ul><div className="member-total"><span>Due today</span><strong>${Number(alley.price).toFixed(2)}</strong><small>Then ${alley.price}/month. Cancel anytime.</small></div></aside></div>
  </main>
}
