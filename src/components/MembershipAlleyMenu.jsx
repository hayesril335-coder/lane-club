import { useState } from 'react'
import './MembershipAlleyMenu.css'
import './MembershipAlleyMenuOverrides.css'

export default function MembershipAlleyMenu({ alleys = [], currentAlley, onSelect }) {
  const [open, setOpen] = useState(false)
  const chooseAlley = alley => { onSelect(alley); setOpen(false) }

  return <div className="membership-alley-menu">
    <button className="membership-alley-trigger" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>Change Alley <span>⌄</span></button>
    {open && <div className="membership-alley-dropdown" role="menu">
      <small>YOUR MEMBERSHIPS</small>
      {alleys.length ? alleys.map(alley => <button type="button" role="menuitem" className={String(alley.id) === String(currentAlley?.id) ? 'active' : ''} onClick={() => chooseAlley(alley)} key={alley.id}>
        <i>{alley.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</i>
        <span><strong>{alley.name}</strong><small>{alley.area}</small></span>
        {String(alley.id) === String(currentAlley?.id) && <b>✓</b>}
      </button>) : <p>No active memberships yet.</p>}
    </div>}
  </div>
}
