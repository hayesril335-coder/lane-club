import { useState } from 'react'
import './OwnerCheckoutPage.css'

export default function OwnerCheckoutPage({ onBack, onContinue }) {
  const [paid, setPaid] = useState(false)
  const submit = (event) => { event.preventDefault(); setPaid(true); onContinue() }

  return <main className="checkout-page">
    <header className="checkout-header"><a className="brand checkout-brand" href="#home" onClick={(e) => { e.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><div className="secure-note"><span>▣</span> Secure checkout</div></header>
    <div className="checkout-shell">
      <section className="checkout-main">
        <button className="checkout-back" onClick={onBack}>← Back to account setup</button>
        <p className="checkout-eyebrow">OWNER SUBSCRIPTION</p><h1>Activate your <em>alley.</em></h1><p className="checkout-lead">Start offering flexible lane memberships to your regulars. You can finish setting up your lanes and pricing after checkout.</p>
        <div className="checkout-stepper"><span className="done">✓</span><i /><span className="current">2</span><i /><span>3</span><small>Account</small><small>Billing</small><small>Set up alley</small></div>
        <form className="billing-form" onSubmit={submit}>
          <h2>Payment details</h2><p className="billing-subtitle">Your subscription starts after your alley setup is complete.</p>
          <label>Cardholder name<input required placeholder="Name on card" autoComplete="cc-name" /></label>
          <label>Card number<div className="card-input"><input required inputMode="numeric" placeholder="1234 1234 1234 1234" autoComplete="cc-number" /><span>VISA</span></div></label>
          <div className="card-row"><label>Expiration date<input required placeholder="MM / YY" autoComplete="cc-exp" /></label><label>Security code<input required placeholder="CVC" inputMode="numeric" autoComplete="cc-csc" /></label></div>
          <label className="save-card"><input type="checkbox" defaultChecked /> <span>Save this payment method for future billing.</span></label>
          <button className="activate-button" type="submit">Activate Lane Club <span>→</span></button>
          {paid && <p className="checkout-message">Payment setup complete. Next, we’ll collect your bowling alley details.</p>}
        </form>
      </section>
      <aside className="order-summary">
        <p className="checkout-eyebrow">YOUR PLAN</p><h2>Lane Club <em>Owner</em></h2><p className="summary-copy">Everything you need to run a membership program your bowlers will love.</p>
        <div className="summary-price"><strong>$1,000</strong><span>per month</span></div>
        <ul><li><b>✓</b> Unlimited member management</li><li><b>✓</b> Lane reservations and schedules</li><li><b>✓</b> Customize your membership price</li><li><b>✓</b> Member payment collection</li><li><b>✓</b> Business performance dashboard</li></ul>
        <div className="summary-total"><span>Due today</span><strong>$1,000.00</strong><small>Then $1,000/month. Cancel anytime.</small></div>
        <p className="summary-support">Questions? <a href="mailto:hello@laneclub.com">Talk to our team</a></p>
      </aside>
    </div>
  </main>
}
