import { useState } from 'react'
import AccountMenu from '../components/AccountMenu'
import { membershipAlleyIds, reservationsForAlley } from '../utils/memberships'
import './MemberSettingsPage.css'
import './MemberMembershipList.css'

const tabs = ['Profile', 'Memberships', 'Payment method', 'Notifications']

export default function MemberSettingsPage({ alley, alleys = [], onBack, onLogout, member, onUpdate, onUpdatePassword }) {
  const [section, setSection] = useState('Profile')
  const [saved, setSaved] = useState('')
  const [profile, setProfile] = useState({ name: member.name, email: member.email, phone: member.phone })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })
  const membershipIds = membershipAlleyIds(member).map(String)
  const memberships = alleys.filter(item => membershipIds.includes(String(item.id)))
  const saveProfile = async event => {
    event.preventDefault()
    setSaved('')
    const changingPassword = Boolean(password.newPassword)
    try {
      onUpdate(profile)
      if (changingPassword) {
        await onUpdatePassword(password)
        setPassword({ currentPassword: '', newPassword: '' })
      }
      setSaved(changingPassword ? 'Profile and password saved successfully.' : 'Profile saved successfully.')
    } catch (error) {
      setSaved(error.message.replace('Firebase: ', ''))
    }
  }

  return <main className="settings-page">
    <header className="settings-header"><a className="brand finder-brand" href="#dashboard" onClick={event => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><nav><button onClick={onBack}>Dashboard</button><button onClick={onBack}>Find an alley</button><button className="nav-active">Account</button></nav><AccountMenu member={member} onOpenSettings={() => setSection('Profile')} onLogout={onLogout} /></header>
    <section className="settings-shell"><header><p>ACCOUNT SETTINGS</p><h1>Your <em>account.</em></h1><span>Manage your profile, memberships, and billing preferences.</span></header>
      <div className="settings-layout"><aside className="settings-nav">{tabs.map(item => <button key={item} className={section === item ? 'active' : ''} onClick={() => { setSection(item); setSaved('') }}>{item}</button>)}<hr /><button className="danger" onClick={() => setSection('Cancel membership')}>Cancel membership</button><button className="danger" onClick={onLogout}>Log out</button></aside>
        <section className="settings-panel">
          {section === 'Profile' && <form onSubmit={saveProfile}><div className="settings-heading"><h2>Profile</h2><p>Update your personal information.</p></div><div className="profile-avatar"><b>{profile.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'LC'}</b><div><strong>Profile information</strong><span>Your initials update from the name below.</span></div></div><div className="settings-fields"><label>Full name<input value={profile.name} onChange={event => setProfile(current => ({ ...current, name: event.target.value }))} required /></label><label>Email address<input type="email" value={profile.email} onChange={event => setProfile(current => ({ ...current, email: event.target.value }))} required /></label><div className="profile-password-fields"><strong>Change password <small>optional</small></strong><label>Current password<input type="password" value={password.currentPassword} onChange={event => setPassword(current => ({ ...current, currentPassword: event.target.value }))} required={Boolean(password.newPassword)} autoComplete="current-password" /></label><label>New password<input type="password" minLength="8" value={password.newPassword} onChange={event => setPassword(current => ({ ...current, newPassword: event.target.value }))} placeholder="At least 8 characters" autoComplete="new-password" /></label><small>Google sign-in accounts manage their password through Google.</small></div><label>Phone number<input type="tel" value={profile.phone} onChange={event => setProfile(current => ({ ...current, phone: event.target.value }))} placeholder="(555) 555-5555" /></label></div><button className="settings-save">Save changes</button></form>}

          {section === 'Memberships' && <section><div className="settings-heading"><h2>Memberships</h2><p>Every bowling alley membership connected to your account.</p></div><div className="membership-settings-list">{memberships.length ? memberships.map(item => { const usedHours = reservationsForAlley(member, item).reduce((total, reservation) => total + Number(reservation.duration || 0), 0); const initials = item.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(); return <div className="membership-setting-card" key={item.id}><div className="setting-alley"><b>{initials}</b><div><strong>{item.name}</strong><span>{item.area} · Active member</span></div><i>Active</i></div><div className="setting-membership-info"><div><span>MONTHLY PRICE</span><strong>${item.price} / month</strong></div><div><span>WEEKLY LANE TIME</span><strong>{usedHours} of 4 hours used</strong></div><div><span>STATUS</span><strong>Active</strong></div></div></div> }) : <p className="no-member-settings">You do not have an active membership yet. Use Search to join an alley.</p>}</div></section>}

          {section === 'Payment method' && <section><div className="settings-heading"><h2>Payment method</h2><p>Manage the card used for monthly billing.</p></div><form onSubmit={event => { event.preventDefault(); setSaved('Payment method saved.') }} className="settings-fields"><label>Cardholder name<input required defaultValue={member.name} /></label><label>Card number<input required placeholder="1234 1234 1234 1234" /></label><label>Expiration date<input required placeholder="MM / YY" /></label><label>Security code<input required placeholder="CVC" /></label><button className="settings-save">Save payment method</button></form></section>}

          {section === 'Notifications' && <form onSubmit={event => { event.preventDefault(); setSaved('Notification preferences saved.') }}><div className="settings-heading"><h2>Notifications</h2><p>Choose what you would like to hear about.</p></div>{['Reservation reminders', 'Weekly hour reminders', 'Membership updates'].map((title, index) => <label className="notification-row" key={title}><span><strong>{title}</strong><small>Update this preference any time.</small></span><input type="checkbox" defaultChecked={index < 2} /></label>)}<button className="settings-save">Save preferences</button></form>}

          {section === 'Cancel membership' && <section><div className="settings-heading"><h2>Cancel membership</h2><p>Cancel the currently selected {alley.name} membership.</p></div><div className="cancel-box"><strong>Your membership remains active until the end of the current billing period.</strong><p>Your other alley memberships will not be affected.</p><button onClick={() => { onUpdate({ hasMembership: false }); setSaved(`${alley.name} membership cancellation saved.`) }}>Cancel this membership</button></div></section>}
          {saved && <p className="settings-message">{saved}</p>}
        </section>
      </div>
    </section>
  </main>
}
