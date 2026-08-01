import './BottomNav.css'

export default function MemberBottomNav({ active, onSearch, onReservations, onPurchase }) {
  const items = [
    ['search', '⌕', 'Search', onSearch],
    ['reservations', '▣', 'Reservations', onReservations],
    ['purchase', '◈', 'Purchase', onPurchase],
  ]
  return <nav className="app-bottom-nav member-bottom-nav" aria-label="Member navigation">
    {items.map(([id, icon, label, action]) => <button key={id} className={active === id ? 'active' : ''} onClick={action} aria-label={label}><span>{icon}</span><strong>{label}</strong></button>)}
  </nav>
}
