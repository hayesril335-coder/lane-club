import { useState } from 'react'
import { usePageRouter } from './hooks/usePageRouter'
import LandingPage from './pages/LandingPage'
import MemberAuthPage from './pages/MemberAuthPage'
import OwnerAuthPage from './pages/OwnerAuthPage'
import OwnerCheckoutPage from './pages/OwnerCheckoutPage'
import AlleySetupPage from './pages/AlleySetupPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'
import LaneManagementPage from './pages/LaneManagementPage'
import ReservationManagementPage from './pages/ReservationManagementPage'
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
  const [member, setMember] = useState({ name: 'New Member', email: '', phone: '', hasMembership: false, usedHours: 0, reservation: null })
  const continueAsMember = ({ fullName } = {}) => {
    setMember(current => ({ ...current, name: fullName || current.name }))
    setPage('find-alley')
  }
  const activateMembership = () => {
    setMember(current => ({ ...current, hasMembership: true }))
    setPage('member-dashboard')
  }
  const addReservation = (reservation) => {
    setMember(current => ({ ...current, reservation, usedHours: current.usedHours + reservation.duration }))
    setPage('reservation-confirmation')
  }
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={() => setPage('owner-checkout')} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={() => setPage('alley-setup')} />
  if (page === 'alley-setup') return <AlleySetupPage onBack={() => setPage('owner-checkout')} onComplete={() => setPage('owner-dashboard')} />
  if (page === 'owner-dashboard') return <OwnerDashboardPage onBack={() => setPage('alley-setup')} onLanes={() => setPage('lane-management')} onReservations={() => setPage('reservation-management')} />
  if (page === 'lane-management') return <LaneManagementPage onBack={() => setPage('owner-dashboard')} />
  if (page === 'reservation-management') return <ReservationManagementPage onBack={() => setPage('owner-dashboard')} onNewReservation={() => setPage('make-reservation')} />
  if (page === 'find-alley') return <FindAlleyPage onBack={() => setPage('member-auth')} onSelect={() => setPage('alley-details')} member={member} onAccount={() => setPage('member-settings')} />
  if (page === 'alley-details') return <AlleyDetailsPage onBack={() => setPage('find-alley')} onJoin={() => hasActiveMembership() ? activateMembership() : setPage('member-checkout')} />
  if (page === 'member-checkout') return <MemberCheckoutPage onBack={() => setPage('alley-details')} onComplete={activateMembership} />
  if (page === 'member-dashboard') return <MemberDashboardPage onBack={() => setPage('find-alley')} onReserve={() => setPage('make-reservation')} onAccount={() => setPage('member-settings')} member={member} />
  if (page === 'make-reservation') return <MakeReservationPage onBack={() => setPage('member-dashboard')} onConfirm={addReservation} member={member} />
  if (page === 'reservation-confirmation') return <ReservationConfirmationPage onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} member={member} />
  if (page === 'member-settings') return <MemberSettingsPage onBack={() => setPage('member-dashboard')} member={member} onUpdate={updates => setMember(current => ({ ...current, ...updates }))} />
  return <LandingPage onNavigate={setPage} />
}
