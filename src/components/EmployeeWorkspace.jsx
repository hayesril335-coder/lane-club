import EmployeeBottomNav from './EmployeeBottomNav'
import './EmployeeWorkspace.css'

export default function EmployeeWorkspace({ alley, active, onReservations, onNewReservation, onStore, onLogout, children }) {
  return <div className="with-bottom-nav employee-workspace">
    <header><div><small>EMPLOYEE WORKSPACE</small><strong>{alley?.name}</strong></div><button onClick={onLogout}>Log out</button></header>
    {children}
    <EmployeeBottomNav active={active} onReservations={onReservations} onNewReservation={onNewReservation} onStore={onStore} />
  </div>
}
