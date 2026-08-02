import './BottomNav.css'

export default function EmployeeBottomNav({ active, onReservations, onNewReservation, onStore, onOrders }) {
  const items = [
    ['reservations', '▣', 'Reservations', onReservations],
    ['new', '+', 'Add', onNewReservation],
    ['store', '◈', 'Store', onStore],
    ['orders', '▤', 'Orders', onOrders],
  ]
  return <nav className="app-bottom-nav employee-bottom-nav" aria-label="Employee navigation">
    {items.map(([id, icon, label, action]) => <button key={id} className={`${active === id ? 'active ' : ''}${id === 'new' ? 'primary' : ''}`} onClick={action} aria-label={label}><span>{icon}</span><strong>{label}</strong></button>)}
  </nav>
}
