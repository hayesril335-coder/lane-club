import './BottomNav.css'

export default function OwnerBottomNav({ active, onOverview, onReservations, onNewReservation, onStore, onOrders }) {
  const items = [
    ['overview', '▦', 'Overview', onOverview],
    ['reservations', '▣', 'Reservations', onReservations],
    ['new', '+', 'Add', onNewReservation],
    ['store', '◈', 'Store', onStore],
    ['orders', '▤', 'Orders', onOrders],
  ]
  return <nav className="app-bottom-nav owner-bottom-nav" aria-label="Owner navigation">
    {items.map(([id, icon, label, action]) => <button key={id} className={`${active === id ? 'active ' : ''}${id === 'new' ? 'primary' : ''}`} onClick={action} aria-label={label}><span>{icon}</span><strong>{label}</strong></button>)}
  </nav>
}
