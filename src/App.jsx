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
import OwnerSettingsPage from './pages/OwnerSettingsPage'
import OwnerStorePage from './pages/OwnerStorePage'
import FindAlleyPage, { defaultAlleys } from './pages/FindAlleyPage'
import AlleyDetailsPage from './pages/AlleyDetailsPage'
import MemberCheckoutPage from './pages/MemberCheckoutPage'
import MemberDashboardPage from './pages/MemberDashboardPage'
import MemberReservationsPage from './pages/MemberReservationsPage'
import MemberStorePage from './pages/MemberStorePage'
import MakeReservationPage from './pages/MakeReservationPage'
import ReservationConfirmationPage from './pages/ReservationConfirmationPage'
import MemberSettingsPage from './pages/MemberSettingsPage'
import MemberBottomNav from './components/MemberBottomNav'
import OwnerBottomNav from './components/OwnerBottomNav'
import { hasActiveMembership } from './utils/demoMode'
import { completeGoogleRedirect, observeAuthState, signInWithGoogleCredential, signOut } from './services/authService'
import { loadAccount, loadAlley, loadAlleys, saveAccount, saveAlley } from './services/accountService'

const newMember = { name: 'New Member', email: '', phone: '', hasMembership: false, usedHours: 0, reservations: [] }

function publicAlley(alley, index) {
  return {
    id: alley.id || alley.ownerId || `owner-${index}`,
    name: alley.name || 'Local Bowling Alley',
    area: alley.area || alley.city || 'Los Angeles',
    distance: Number(alley.distance || 2.5),
    price: Number(alley.price || alley.membershipPrice || 20),
    lanes: Number(alley.lanes || alley.laneCount || 12),
    rating: Number(alley.rating || 4.8),
    reviews: Number(alley.reviews || 0),
    tags: Array.isArray(alley.tags) ? alley.tags : ['Lane Club partner'],
    color: alley.color || 'highland',
    ...alley,
  }
}

function mergePublicAlleys(savedAlleys) {
  const normalized = savedAlleys.map(publicAlley)
  return [...defaultAlleys.map(defaultAlley => normalized.find(item => item.name === defaultAlley.name) ? { ...defaultAlley, ...normalized.find(item => item.name === defaultAlley.name) } : defaultAlley), ...normalized.filter(item => !defaultAlleys.some(defaultAlley => defaultAlley.name === item.name))]
}

export default function App() {
  const { page, navigate: setPage } = usePageRouter()
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [member, setMember] = useState(newMember)
  const [ownerAlley, setOwnerAlley] = useState(null)
  const [availableAlleys, setAvailableAlleys] = useState(defaultAlleys)
  const [now, setNow] = useState(() => new Date())
  const [ownerReservations, setOwnerReservations] = useState([])
  const [selectedAlley, setSelectedAlley] = useState(defaultAlleys[0])

  useEffect(() => {
    let unsubscribe = () => {}
    const initializeAuth = async () => {
      const postedGoogleToken = sessionStorage.getItem('lane-club-google-id-token')
      if (postedGoogleToken) {
        sessionStorage.removeItem('lane-club-google-id-token')
        try { await signInWithGoogleCredential(postedGoogleToken, localStorage.getItem('lane-club-google-role') || 'member') } catch (error) { console.error(error) }
      }
      try { await completeGoogleRedirect() } catch (error) { console.error(error) }
      unsubscribe = observeAuthState(async authUser => {
        setUser(authUser)
        if (authUser) {
          let account = await loadAccount(authUser.uid)
          const [alley, publicAlleys] = await Promise.all([loadAlley(authUser.uid), loadAlleys().catch(() => [])])
          const pendingGoogleRole = localStorage.getItem('lane-club-google-role')
          if (!account && pendingGoogleRole) {
            account = { name: authUser.displayName || 'Lane Club Member', email: authUser.email, role: pendingGoogleRole, phone: '', hasMembership: false, usedHours: 0, reservations: [] }
            await saveAccount(authUser.uid, account)
          }
          setMember(current => ({ ...current, ...account, name: account?.name || authUser.displayName || 'Lane Club Member', email: authUser.email }))
          setOwnerAlley(alley)
          setOwnerReservations(Array.isArray(alley?.reservations) ? alley.reservations : [])
          if (publicAlleys.length) setAvailableAlleys(mergePublicAlleys(publicAlleys))
          if (pendingGoogleRole) {
            localStorage.removeItem('lane-club-google-role')
            setPage(pendingGoogleRole === 'owner' ? (alley ? 'owner-dashboard' : 'owner-checkout') : 'member-dashboard')
          } else if (page === 'home' || page === 'member-auth' || page === 'owner-auth') {
            setPage(account?.role === 'owner' ? (alley ? 'owner-dashboard' : 'owner-checkout') : 'member-dashboard')
          }
        }
        setAuthReady(true)
      })
    }
    initializeAuth()
    return () => unsubscribe()
  }, [])

  useEffect(() => { if (user && authReady) saveAccount(user.uid, member).catch(console.error) }, [member, user, authReady])
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  useEffect(() => {
    const weekStart = date => { const copy = new Date(date); copy.setHours(0, 0, 0, 0); copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7)); return copy.getTime() }
    setMember(current => {
      const reservations = current.reservations.filter(reservation => weekStart(reservation.createdAt) === weekStart(now))
      const usedHours = reservations.reduce((total, reservation) => total + reservation.duration, 0)
      return reservations.length === current.reservations.length && usedHours === current.usedHours ? current : { ...current, reservations, usedHours }
    })
  }, [now])

  const continueAsMember = async ({ user: authUser, fullName, email } = {}) => {
    setUser(authUser)
    const next = { ...member, name: fullName || authUser?.displayName || member.name, email: email || authUser?.email || member.email, role: 'member' }
    setMember(next)
    if (authUser) await saveAccount(authUser.uid, next)
    setPage('find-alley')
  }
  const activateMembership = async () => {
    setMember(current => ({ ...current, hasMembership: true, membershipAlleyId: selectedAlley.id }))
    setPage('member-dashboard')
    if (selectedAlley.ownerId && user) {
      try {
        const alley = await loadAlley(selectedAlley.ownerId)
        const members = [...(alley?.members || []).filter(item => item.uid !== user.uid), { uid: user.uid, name: member.name, email: user.email, active: true, joinedAt: new Date().toISOString() }]
        await saveAlley(selectedAlley.ownerId, { ...alley, members })
      } catch (error) { console.error(error) }
    }
  }
  const addReservation = async reservation => {
    const savedReservation = { ...reservation, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setMember(current => ({ ...current, reservations: [...current.reservations, savedReservation], usedHours: current.usedHours + reservation.duration }))
    setPage('reservation-confirmation')
    if (selectedAlley.ownerId) {
      try {
        const alley = await loadAlley(selectedAlley.ownerId)
        const ownerReservation = { ...savedReservation, lane: `Lane ${String(reservation.lane).padStart(2, '0')}`, name: member.name, email: member.email, initials: member.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(), hours: `${reservation.duration} hours`, durationHours: reservation.duration, status: 'Confirmed', source: 'member', amount: 0 }
        await saveAlley(selectedAlley.ownerId, { ...alley, reservations: [...(alley?.reservations || []), ownerReservation] })
      } catch (error) { console.error(error) }
    }
  }
  const logout = async () => { await signOut(); setUser(null); setMember(newMember); setPage('home') }
  const selectAlley = alley => { setSelectedAlley(alley); setPage('alley-details') }
  const addOwnerProduct = async product => {
    const nextAlley = { ...(ownerAlley || { name: 'Your bowling alley' }), products: [...(ownerAlley?.products || []), product] }
    setOwnerAlley(nextAlley)
    if (user) await saveAlley(user.uid, nextAlley)
    setAvailableAlleys(current => current.map(alley => alley.ownerId === user?.uid || alley.name === nextAlley.name ? { ...alley, ...nextAlley } : alley))
  }
  const addOwnerCategory = async category => {
    const categories = [...new Set([...(ownerAlley?.productCategories || []), category.trim()])]
    const nextAlley = { ...(ownerAlley || { name: 'Your bowling alley' }), productCategories: categories }
    setOwnerAlley(nextAlley)
    if (user) await saveAlley(user.uid, nextAlley)
  }
  const addOwnerReservation = async reservation => {
    const nextReservation = { ...reservation, createdAt: reservation.createdAt || new Date().toISOString(), date: reservation.date || new Date().toLocaleDateString('en-CA') }
    const reservations = [...ownerReservations, nextReservation]
    setOwnerReservations(reservations)
    const nextAlley = { ...(ownerAlley || { name: 'Your bowling alley' }), reservations }
    setOwnerAlley(nextAlley)
    if (user) await saveAlley(user.uid, nextAlley)
  }

  const memberNav = active => <MemberBottomNav active={active} onSearch={() => setPage('find-alley')} onReservations={() => setPage('member-reservations')} onPurchase={() => setPage('member-store')} />
  const memberPage = (content, active) => <div className="with-bottom-nav">{content}{memberNav(active)}</div>
  const ownerNavProps = { onOverview: () => setPage('owner-dashboard'), onReservations: () => setPage('reservation-management'), onNewReservation: () => setPage('owner-walk-in-reservation'), onStore: () => setPage('owner-store'), onSettings: () => setPage('owner-settings') }
  const ownerPage = (content, active) => <div className="with-bottom-nav">{content}<OwnerBottomNav {...ownerNavProps} active={active} /></div>

  if (!authReady) return <main className="setup-page"><p className="notice">Loading Lane Club…</p></main>
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={async ({ user: authUser, alleyName }) => { setUser(authUser); const existingAlley = await loadAlley(authUser.uid); await saveAccount(authUser.uid, { name: authUser.displayName || 'Alley Owner', email: authUser.email, role: 'owner' }); setOwnerAlley(existingAlley || { name: alleyName }); setPage(existingAlley ? 'owner-dashboard' : 'owner-checkout') }} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={() => setPage('alley-setup')} />
  if (page === 'alley-setup') return <AlleySetupPage initialAlley={ownerAlley} onBack={() => setPage('owner-checkout')} onComplete={async alley => { setOwnerAlley(alley); if (user) await saveAlley(user.uid, alley); setPage('owner-dashboard') }} />

  if (page === 'owner-dashboard') return ownerPage(<OwnerDashboardPage alley={ownerAlley} reservations={ownerReservations} now={now} />, 'overview')
  if (page === 'lane-management') return ownerPage(<LaneManagementPage onBack={() => setPage('owner-dashboard')} />, 'settings')
  if (page === 'reservation-management') return ownerPage(<ReservationManagementPage bookings={ownerReservations} alley={ownerAlley} />, 'reservations')
  if (page === 'owner-walk-in-reservation') return ownerPage(<OwnerWalkInReservationPage alley={ownerAlley} onBack={() => setPage('reservation-management')} onComplete={async reservation => { await addOwnerReservation(reservation); setPage('reservation-management') }} />, 'new')
  if (page === 'owner-store') return ownerPage(<OwnerStorePage alley={ownerAlley} onAddProduct={addOwnerProduct} onAddCategory={addOwnerCategory} />, 'store')
  if (page === 'owner-settings') return ownerPage(<OwnerSettingsPage onBack={() => setPage('owner-dashboard')} onLanes={() => setPage('lane-management')} />, 'settings')

  if (page === 'find-alley') return memberPage(<FindAlleyPage alleys={availableAlleys} onBack={() => setPage('member-dashboard')} onSelect={selectAlley} member={member} onAccount={() => setPage('member-settings')} onLogout={logout} />, 'search')
  if (page === 'alley-details') return memberPage(<AlleyDetailsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onJoin={() => hasActiveMembership() ? activateMembership() : setPage('member-checkout')} />, 'search')
  if (page === 'member-checkout') return memberPage(<MemberCheckoutPage alley={selectedAlley} onBack={() => setPage('alley-details')} onComplete={activateMembership} />, 'search')
  if (page === 'member-dashboard') return memberPage(<MemberDashboardPage alley={selectedAlley} now={now} onBack={() => setPage('find-alley')} onReserve={() => setPage('make-reservation')} onReservations={() => setPage('member-reservations')} onAccount={() => setPage('member-settings')} member={member} />, '')
  if (page === 'member-reservations') return memberPage(<MemberReservationsPage alley={selectedAlley} member={member} onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} />, 'reservations')
  if (page === 'member-store') return memberPage(<MemberStorePage alley={selectedAlley} onDashboard={() => setPage('member-dashboard')} />, 'purchase')
  if (page === 'make-reservation') return memberPage(<MakeReservationPage alley={selectedAlley} onBack={() => setPage('member-reservations')} onConfirm={addReservation} member={member} />, 'reservations')
  if (page === 'reservation-confirmation') return memberPage(<ReservationConfirmationPage alley={selectedAlley} onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} member={member} />, 'reservations')
  if (page === 'member-settings') return memberPage(<MemberSettingsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onLogout={logout} member={member} onUpdate={updates => setMember(current => ({ ...current, ...updates }))} />, '')
  return <LandingPage onNavigate={setPage} />
}
