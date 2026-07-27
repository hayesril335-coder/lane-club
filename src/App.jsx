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
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={() => setPage('find-alley')} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={() => setPage('owner-checkout')} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={() => setPage('alley-setup')} />
  if (page === 'alley-setup') return <AlleySetupPage onBack={() => setPage('owner-checkout')} onComplete={() => setPage('owner-dashboard')} />
  if (page === 'owner-dashboard') return <OwnerDashboardPage onBack={() => setPage('alley-setup')} onLanes={() => setPage('lane-management')} onReservations={() => setPage('reservation-management')} />
  if (page === 'lane-management') return <LaneManagementPage onBack={() => setPage('owner-dashboard')} />
  if (page === 'reservation-management') return <ReservationManagementPage onBack={() => setPage('owner-dashboard')} />
  if (page === 'find-alley') return <FindAlleyPage onBack={() => setPage('member-auth')} onSelect={() => setPage('alley-details')} />
  if (page === 'alley-details') return <AlleyDetailsPage onBack={() => setPage('find-alley')} onJoin={() => setPage(hasActiveMembership() ? 'member-dashboard' : 'member-checkout')} />
  if (page === 'member-checkout') return <MemberCheckoutPage onBack={() => setPage('alley-details')} onComplete={() => setPage('member-dashboard')} />
  if (page === 'member-dashboard') return <MemberDashboardPage onBack={() => setPage('find-alley')} onReserve={() => setPage('make-reservation')} />
  if (page === 'make-reservation') return <MakeReservationPage onBack={() => setPage('member-dashboard')} onConfirm={() => setPage('reservation-confirmation')} />
  if (page === 'reservation-confirmation') return <ReservationConfirmationPage onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} />
  if (page === 'member-settings') return <MemberSettingsPage onBack={() => setPage('member-dashboard')} />
  return <LandingPage onNavigate={setPage} />
}
