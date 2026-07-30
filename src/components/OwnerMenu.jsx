import { useState } from 'react'

export default function OwnerMenu({ onOverview, onReservations, onNewReservation, onSettings }) {
  const [open, setOpen] = useState(false)
  const go = action => { setOpen(false); action() }
  return <>{open && <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#102e3ce6', padding: '88px 24px' }}><button onClick={() => setOpen(false)} style={{ position: 'absolute', right: 22, top: 18, border: 0, background: 'transparent', color: '#fff', fontSize: 30 }}>×</button><div style={{ maxWidth: 360, margin: 'auto', display: 'grid', gap: 12 }}><strong style={{ color: '#f2c447', letterSpacing: 2 }}>OWNER MENU</strong>{[['Overview', onOverview], ['Upcoming reservations', onReservations], ['+ New reservation', onNewReservation], ['Settings', onSettings]].map(([label, action]) => <button key={label} onClick={() => go(action)} style={{ height: 54, textAlign: 'left', padding: '0 18px', border: '1px solid #56717d', borderRadius: 4, background: '#1d475b', color: '#fff', fontSize: 16 }}>{label}</button>)}</div></div>}<button className="owner-hamburger" onClick={() => setOpen(true)} aria-label="Open owner menu">☰</button></>
}
