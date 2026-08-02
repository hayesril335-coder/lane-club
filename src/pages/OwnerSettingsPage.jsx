import { useState } from 'react'
import './OwnerSettingsPage.css'

const lastFour = value => String(value || '').replace(/\D/g, '').slice(-4)

export default function OwnerSettingsPage({ alley, onBack, onLanes, onLeagueSetup, onSave }) {
  const [name, setName] = useState(alley?.name || '')
  const [message, setMessage] = useState('')
  const save = async (updates, success) => { await onSave(updates); setMessage(success) }
  const saveBank = event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    return save({ payoutBank: { bankName: String(form.get('bankName')), accountHolder: String(form.get('accountHolder')), routingLast4: lastFour(form.get('routingNumber')), accountLast4: lastFour(form.get('accountNumber')) } }, 'Payout bank account saved.')
  }
  const saveBilling = event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const cardNumber = String(form.get('cardNumber'))
    return save({ ownerBillingMethod: { cardholder: String(form.get('cardholder')), brand: cardNumber.startsWith('4') ? 'Visa' : 'Card', last4: lastFour(cardNumber), expiration: String(form.get('expiration')) } }, 'Lane Club subscription payment method saved.')
  }
  return <main className="owner-settings"><header><button onClick={onBack}>← Back to overview</button><strong>LANE CLUB</strong></header><section><p>ALLEY SETTINGS</p><h1>Manage your <em>alley.</em></h1>
    <form onSubmit={event => { event.preventDefault(); save({ name }, 'Alley name saved.') }}><h2>Alley details</h2><label>Bowling alley name<input value={name} onChange={event => setName(event.target.value)} required /></label><button>Save alley name</button></form>
    <article><h2>Lane names</h2><p>Rename lanes and manage their availability in lane management.</p><button onClick={onLanes}>Manage lane names →</button><button className="league-setup-link" onClick={onLeagueSetup}>Setup a league →</button></article>
    <form onSubmit={saveBank}><h2>Bank account for payouts</h2><p>Choose the account where Lane Club funds should be deposited.</p><div className="settings-grid"><label>Account holder<input name="accountHolder" required defaultValue={alley?.payoutBank?.accountHolder || ''} /></label><label>Bank name<input name="bankName" required defaultValue={alley?.payoutBank?.bankName || ''} /></label><label>Routing number<input name="routingNumber" required inputMode="numeric" placeholder={alley?.payoutBank?.routingLast4 ? `•••••${alley.payoutBank.routingLast4}` : 'Routing number'} /></label><label>Account number<input name="accountNumber" required inputMode="numeric" placeholder={alley?.payoutBank?.accountLast4 ? `••••${alley.payoutBank.accountLast4}` : 'Account number'} /></label></div><button>Save payout account</button><small>Only masked account details are retained in Lane Club.</small></form>
    <form onSubmit={saveBilling}><h2>$1,000/month payment method</h2><p>Edit the card used for the Lane Club owner subscription.</p><div className="settings-grid"><label>Cardholder name<input name="cardholder" required defaultValue={alley?.ownerBillingMethod?.cardholder || ''} /></label><label>Card number<input name="cardNumber" required inputMode="numeric" placeholder={alley?.ownerBillingMethod?.last4 ? `•••• •••• •••• ${alley.ownerBillingMethod.last4}` : 'Card number'} /></label><label>Expiration<input name="expiration" required placeholder="MM / YY" defaultValue={alley?.ownerBillingMethod?.expiration || ''} /></label><label>Security code<input name="cvc" required inputMode="numeric" placeholder="CVC" /></label></div><button>Update subscription card</button><small>Only the card brand, last four digits, and expiration are retained.</small></form>
    {message && <p className="settings-message">{message}</p>}
  </section></main>
}
