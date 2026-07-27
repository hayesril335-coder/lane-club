import { useState } from 'react'

export default function AccountMenu({ member, onOpenSettings, onLogout }) {
  const [open, setOpen] = useState(false)
  const initials = member.name.split(' ').filter(Boolean).map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'LC'
  return <div className="account-menu"><button className="account-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}><i>{initials}</i><span>{member.name}</span><b>⌄</b></button>{open && <div className="account-dropdown"><strong>{member.name}</strong><small>{member.email || 'Demo account'}</small><button onClick={() => { setOpen(false); onOpenSettings() }}>Profile & settings</button>{onLogout && <button className="account-logout" onClick={() => { setOpen(false); onLogout() }}>Log out</button>}</div>}</div>
}
