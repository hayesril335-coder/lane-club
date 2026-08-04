import { useState } from 'react'
import './MemberLeagueJoinPage.css'

export default function MemberLeagueJoinPage({ alley, league, member, onBack, onValidate, onPurchase }) {
  const [code, setCode] = useState('')
  const [step, setStep] = useState('code')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (!league) return <main className="member-league-join"><section><button className="league-join-back" onClick={onBack}>← Back to search</button><p>This league is no longer available.</p></section></main>

  const validate = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const normalized = await onValidate(code); setCode(normalized); setStep('purchase') } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
  const purchase = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await onPurchase(code); setStep('complete') } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }

  return <main className="member-league-join"><header><button onClick={onBack}>← Back to search</button><strong>LANE CLUB</strong><span>Join a league</span></header><section><div className="league-join-summary"><p>LEAGUE AT {alley.name.toUpperCase()}</p><h1>{league.name}</h1><span>${Number(league.monthlyPrice || 0).toFixed(2)} per month</span></div>
    {step === 'code' && <form onSubmit={validate}><h2>Enter your league password.</h2><p>Get a one-time password from the bowling alley. It can only be used for this league.</p><label>10-digit password<input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" pattern="\d{10}" required placeholder="1234567890" /></label><button disabled={busy}>{busy ? 'Checking…' : 'Continue →'}</button></form>}
    {step === 'purchase' && <form onSubmit={purchase}><h2>Purchase your subscription.</h2><p>{member.name}, your accepted password is reserved until this purchase is completed.</p><div className="league-card-fields"><label>Cardholder name<input defaultValue={member.name} /></label><label>Card number<input inputMode="numeric" placeholder="1234 1234 1234 1234" /></label><label>Expiration<input placeholder="MM / YY" /></label><label>Security code<input inputMode="numeric" placeholder="CVC" /></label></div><small>Testing mode: card details are optional and no payment will be charged.</small><button disabled={busy}>{busy ? 'Joining…' : `Purchase $${Number(league.monthlyPrice || 0).toFixed(2)}/month →`}</button></form>}
    {step === 'complete' && <div className="league-join-complete"><span>✓</span><h2>You joined {league.name}.</h2><p>Your one-time password has been used and cannot be used by another account.</p><button onClick={onBack}>Back to bowling alleys</button></div>}
    {message && <p className="league-join-message">{message}</p>}
  </section></main>
}
