import { useState } from 'react'
import EmployeeAccessSettings from '../components/EmployeeAccessSettings'
import './OwnerSettingsPage.css'
import './OwnerSettingsActions.css'

const lastFour = value => String(value || '').replace(/\D/g, '').slice(-4)

export default function OwnerSettingsPage({ alley, email, onEditStore, onLanes, onLeagueSetup, onSave, onUpdateCredentials, onCancelService, onLogout }) {
  const [name, setName] = useState(alley?.name || '')
  const [message, setMessage] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)
  const save = async (updates, success) => { await onSave(updates); if (success) setMessage(success) }
  const run = async action => { setBusy(true); setMessage(''); try { await action() } catch (error) { setMessage(error.message.replace('Firebase: ', '')) } finally { setBusy(false) } }
  const saveCredentials = event => { event.preventDefault(); const form = new FormData(event.currentTarget); return run(async () => { await onUpdateCredentials({ currentPassword: String(form.get('currentPassword')), newEmail: String(form.get('newEmail')), newPassword: String(form.get('newPassword')) }); event.currentTarget.reset(); setMessage('Login email and password updated.') }) }
  const saveBank = event => { event.preventDefault(); const form = new FormData(event.currentTarget); return run(() => save({ payoutBank: { bankName: String(form.get('bankName')), accountHolder: String(form.get('accountHolder')), routingLast4: lastFour(form.get('routingNumber')), accountLast4: lastFour(form.get('accountNumber')) } }, 'Payout bank account saved.')) }
  const saveBilling = event => { event.preventDefault(); const form = new FormData(event.currentTarget); const cardNumber = String(form.get('cardNumber')); return run(() => save({ ownerBillingMethod: { cardholder: String(form.get('cardholder')), brand: cardNumber.startsWith('4') ? 'Visa' : 'Card', last4: lastFour(cardNumber), expiration: String(form.get('expiration')) } }, 'Lane Club subscription payment method saved.')) }

  return <main className="owner-settings"><section>
    <p>ALLEY SETTINGS</p>
    <h1>Manage your <em>alley.</em></h1>

    <form onSubmit={event => { event.preventDefault(); run(() => save({ name }, 'Alley name saved.')) }}>
      <h2>Alley details</h2>
      <label>Bowling alley name<input value={name} onChange={event => setName(event.target.value)} required /></label>
      <button disabled={busy}>Save alley name</button>
    </form>

    <article><h2>Store</h2><p>Edit product categories, pictures, prices, titles, and descriptions.</p><button onClick={onEditStore}>Edit store →</button></article>
    <article><h2>Lane names</h2><p>Rename lanes and manage their availability in lane management.</p><button onClick={onLanes}>Manage lane names →</button></article>
    <article><h2>Leagues</h2><p>Create leagues, set pricing, and choose league lanes and dates.</p><button className="league-setup-link" onClick={onLeagueSetup}>Setup a league →</button></article>

    <EmployeeAccessSettings savedCode={alley?.employeeCode} onSave={onSave} />

    <form onSubmit={saveCredentials}>
      <h2>Change email and password</h2>
      <p>For security, enter your current password before changing login details.</p>
      <div className="settings-grid">
        <label>New email<input name="newEmail" type="email" required defaultValue={email} /></label>
        <label>Current password<input name="currentPassword" type="password" required /></label>
        <label>New password <small>optional</small><input name="newPassword" type="password" minLength="8" placeholder="At least 8 characters" /></label>
      </div>
      <button disabled={busy}>Update login details</button>
      <small>Google sign-in accounts manage their email and password through Google.</small>
    </form>

    <form onSubmit={saveBank}>
      <h2>Bank account for payouts</h2><p>Choose the account where Lane Club funds should be deposited.</p>
      <div className="settings-grid">
        <label>Account holder<input name="accountHolder" required defaultValue={alley?.payoutBank?.accountHolder || ''} /></label>
        <label>Bank name<input name="bankName" required defaultValue={alley?.payoutBank?.bankName || ''} /></label>
        <label>Routing number<input name="routingNumber" required inputMode="numeric" placeholder={alley?.payoutBank?.routingLast4 ? `•••••${alley.payoutBank.routingLast4}` : 'Routing number'} /></label>
        <label>Account number<input name="accountNumber" required inputMode="numeric" placeholder={alley?.payoutBank?.accountLast4 ? `••••${alley.payoutBank.accountLast4}` : 'Account number'} /></label>
      </div>
      <button disabled={busy}>Save payout account</button><small>Only masked account details are retained in Lane Club.</small>
    </form>

    <form onSubmit={saveBilling}>
      <h2>$1,000/month payment method</h2><p>Edit the card used for the Lane Club owner subscription.</p>
      <div className="settings-grid">
        <label>Cardholder name<input name="cardholder" required defaultValue={alley?.ownerBillingMethod?.cardholder || ''} /></label>
        <label>Card number<input name="cardNumber" required inputMode="numeric" placeholder={alley?.ownerBillingMethod?.last4 ? `•••• •••• •••• ${alley.ownerBillingMethod.last4}` : 'Card number'} /></label>
        <label>Expiration<input name="expiration" required placeholder="MM / YY" defaultValue={alley?.ownerBillingMethod?.expiration || ''} /></label>
        <label>Security code<input name="cvc" required inputMode="numeric" placeholder="CVC" /></label>
      </div>
      <button disabled={busy}>Update subscription card</button><small>Only the card brand, last four digits, and expiration are retained.</small>
    </form>

    <article className="danger-settings"><h2>Cancel service</h2><p>Cancel the Lane Club owner service and stop access to owner tools. You can reactivate later.</p>{confirmCancel ? <div className="cancel-confirm"><button onClick={() => setConfirmCancel(false)}>Keep service</button><button onClick={() => run(onCancelService)} disabled={busy}>Confirm cancellation</button></div> : <button onClick={() => setConfirmCancel(true)}>Cancel service</button>}</article>
    <article className="logout-settings"><h2>Account session</h2><p>Sign out of this owner account on this device.</p><button onClick={onLogout}>Log out</button></article>
    {message && <p className="settings-message">{message}</p>}
  </section></main>
}
