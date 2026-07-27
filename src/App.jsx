import { useEffect, useState } from 'react'
import { usePageRouter } from './hooks/usePageRouter'
import LandingPage from './pages/LandingPage'
import MemberAuthPage from './pages/MemberAuthPage'
import OwnerAuthPage from './pages/OwnerAuthPage'
import OwnerCheckoutPage from './pages/OwnerCheckoutPage'
import AlleySetupPage from './pages/AlleySetupPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'
import LaneManagementPage from './pages/LaneManagementPage'
import ReservationManagementPage from './pages/ReservationManagementPage'
import OwnerWalkInReservationPage from './pages/OwnerWalkInReservationPage'
import FindAlleyPage from './pages/FindAlleyPage'
import AlleyDetailsPage from './pages/AlleyDetailsPage'
import MemberCheckoutPage from './pages/MemberCheckoutPage'
import MemberDashboardPage from './pages/MemberDashboardPage'
import MakeReservationPage from './pages/MakeReservationPage'
import ReservationConfirmationPage from './pages/ReservationConfirmationPage'
import MemberSettingsPage from './pages/MemberSettingsPage'
import { hasActiveMembership } from './utils/demoMode'

export default function App() {
  const { page, navigate: setPage } = usePageRouter()
  const [member, setMember] = useState({ name: 'New Member', email: '', phone: '', hasMembership: false, usedHours: 0, reservations: [] })
  const [now, setNow] = useState(() => new Date())
  const [selectedAlley, setSelectedAlley] = useState({ id: 1, name: 'Sunset Lanes', area: 'Downtown Los Angeles', distance: 1.2, price: 20, lanes: 16, rating: 4.8, reviews: 124, tags: ['Late night', 'Food & drinks'], color: 'sunset' })
  const continueAsMember = ({ fullName } = {}) => {
    setMember(current => ({ ...current, name: fullName || current.name }))
    setPage('find-alley')
  }
  const activateMembership = () => {
    setMember(current => ({ ...current, hasMembership: true }))
    setPage('member-dashboard')
  }
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const weekStart = date => {
      const copy = new Date(date)
      copy.setHours(0, 0, 0, 0)
      copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7))
      return copy.getTime()
    }
    setMember(current => {
      const reservations = current.reservations.filter(reservation => weekStart(reservation.createdAt) === weekStart(now))
      const usedHours = reservations.reduce((total, reservation) => total + reservation.duration, 0)
      return reservations.length === current.reservations.length && usedHours === current.usedHours ? current : { ...current, reservations, usedHours }
    })
  }, [now])
  const addReservation = (reservation) => {
    setMember(current => ({ ...current, reservations: [...current.reservations, { ...reservation, id: crypto.randomUUID(), createdAt: new Date().toISOString() }], usedHours: current.usedHours + reservation.duration }))
    setPage('reservation-confirmation')
  }
  const logout = () => {
    setMember({ name: 'New Member', email: '', phone: '', hasMembership: false, usedHours: 0, reservations: [] })
    setPage('home')
  }
  const selectAlley = (alley) => {
    setSelectedAlley(alley)
    setPage('alley-details')
  }
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={() => setPage('owner-checkout')} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={() => setPage('alley-setup')} />
  if (page === 'alley-setup') return <AlleySetupPage onBack={() => setPage('owner-checkout')} onComplete={() => setPage('owner-dashboard')} />
  if (page === 'owner-dashboard') return <OwnerDashboardPage onBack={() => setPage('alley-setup')} onLanes={() => setPage('lane-management')} onReservations={() => setPage('reservation-management')} />
  if (page === 'lane-management') return <LaneManagementPage onBack={() => setPage('owner-dashboard')} />
  if (page === 'reservation-management') return <ReservationManagementPage onBack={() => setPage('owner-dashboard')} onNewReservation={() => setPage('owner-walk-in-reservation')} />
  if (page === 'owner-walk-in-reservation') return <OwnerWalkInReservationPage onBack={() => setPage('reservation-management')} />
  if (page === 'find-alley') return <FindAlleyPage onBack={() => setPage('member-dashboard')} onSelect={selectAlley} member={member} onAccount={() => setPage('member-settings')} onLogout={logout} />
  if (page === 'alley-details') return <AlleyDetailsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onJoin={() => hasActiveMembership() ? activateMembership() : setPage('member-checkout')} />
  if (page === 'member-checkout') return <MemberCheckoutPage alley={selectedAlley} onBack={() => setPage('alley-details')} onComplete={activateMembership} />
  if (page === 'member-dashboard') return <MemberDashboardPage alley={selectedAlley} now={now} onBack={() => setPage('find-alley')} onReserve={() => setPage('make-reservation')} onAccount={() => setPage('member-settings')} onLogout={logout} member={member} />
  if (page === 'make-reservation') return <MakeReservationPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onConfirm={addReservation} member={member} />
  if (page === 'reservation-confirmation') return <ReservationConfirmationPage alley={selectedAlley} onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} member={member} />
  if (page === 'member-settings') return <MemberSettingsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onLogout={logout} member={member} onUpdate={updates => setMember(current => ({ ...current, ...updates }))} />
  return <LandingPage onNavigate={setPage} />
}
