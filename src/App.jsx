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
import OwnerStorefrontPage from './pages/OwnerStorefrontPage'
import EmployeeLoginPage from './pages/EmployeeLoginPage'
import OrdersPage from './pages/OrdersPage'
import LeagueSetupPage from './pages/LeagueSetupPage'
import LeagueSignupPage from './pages/LeagueSignupPage'
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
import EmployeeWorkspace from './components/EmployeeWorkspace'
import OwnerSettingsShortcut from './components/OwnerSettingsShortcut'
import { hasActiveMembership } from './utils/demoMode'
import { isReservationActive } from './utils/reservations'
import { hasMembershipAt, memberForAlley, membershipAlleyIds } from './utils/memberships'
import { completeGoogleRedirect, observeAuthState, signInWithGoogleCredential, signOut, updateLoginCredentials } from './services/authService'
import { findAlleyByEmployeeCode, loadAccount, loadAlley, loadAlleys, saveAccount, saveAlley } from './services/accountService'

const newMember = { name: 'New Member', email: '', phone: '', hasMembership: false, membershipAlleyIds: [], usedHours: 0, reservations: [] }

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

const pendingOrdersKey = ownerId => `lane-club-employee-orders-${ownerId}`
const uniqueOrders = orders => [...new Map(orders.map(order => [order.id, order])).values()]
const pendingEmployeeOrders = ownerId => {
  try { return JSON.parse(localStorage.getItem(pendingOrdersKey(ownerId)) || '[]') } catch { return [] }
}
const withPendingEmployeeOrders = alley => {
  const ownerId = alley?.ownerId || alley?.id
  return !ownerId ? alley : { ...alley, orders: uniqueOrders([...(alley.orders || []), ...pendingEmployeeOrders(ownerId)]) }
}
const loadOwnerAlleyWithPendingOrders = async ownerId => {
  let alley = await loadAlley(ownerId)
  const queuedOrders = pendingEmployeeOrders(ownerId)
  if (alley && queuedOrders.length) {
    alley = { ...alley, orders: uniqueOrders([...(alley.orders || []), ...queuedOrders]) }
    await saveAlley(ownerId, alley)
    localStorage.removeItem(pendingOrdersKey(ownerId))
  }
  return alley
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
  const [employeeAlley, setEmployeeAlley] = useState(null)
  const activeMember = memberForAlley(member, selectedAlley)

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
          const [alley, publicAlleys] = await Promise.all([loadOwnerAlleyWithPendingOrders(authUser.uid), loadAlleys().catch(() => [])])
          const pendingGoogleRole = localStorage.getItem('lane-club-google-role')
          if (!account && pendingGoogleRole) {
            account = { name: authUser.displayName || 'Lane Club Member', email: authUser.email, role: pendingGoogleRole, phone: '', hasMembership: false, usedHours: 0, reservations: [] }
            await saveAccount(authUser.uid, account)
          }
          if (account?.role !== 'owner') {
            const memberships = membershipAlleyIds(account)
            if (account?.hasMembership && !memberships.length) memberships.push(account.selectedAlleyId || defaultAlleys[0].id)
            account = { ...account, membershipAlleyIds: memberships }
          }
          setMember(current => ({ ...current, ...account, name: account?.name || authUser.displayName || 'Lane Club Member', email: authUser.email }))
          setOwnerAlley(alley)
          setOwnerReservations(Array.isArray(alley?.reservations) ? alley.reservations : [])
          if (publicAlleys.length) {
            const mergedAlleys = mergePublicAlleys(publicAlleys)
            setAvailableAlleys(mergedAlleys)
            const preferredAlleyId = account?.selectedAlleyId || membershipAlleyIds(account).at(-1)
            const preferredAlley = mergedAlleys.find(item => String(item.id) === String(preferredAlleyId))
            if (preferredAlley) setSelectedAlley(preferredAlley)
          }
          if (pendingGoogleRole) {
            localStorage.removeItem('lane-club-google-role')
            setPage(pendingGoogleRole === 'owner' ? (alley && alley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') : 'member-dashboard')
          } else if (page === 'home' || page === 'member-auth' || page === 'member-auth-login' || page === 'owner-auth' || page === 'owner-auth-login') {
            setPage(account?.role === 'owner' ? (alley && alley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') : 'member-dashboard')
          }
        } else {
          const employeeCode = localStorage.getItem('lane-club-employee-code')
          if (employeeCode) {
            const foundAlley = await findAlleyByEmployeeCode(employeeCode).catch(() => null)
            const alley = foundAlley ? withPendingEmployeeOrders(foundAlley) : null
            if (alley) {
              setEmployeeAlley(alley)
              setOwnerReservations(Array.isArray(alley.reservations) ? alley.reservations : [])
              setPage('employee-reservations')
            } else localStorage.removeItem('lane-club-employee-code')
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
  useEffect(() => {
    if (!ownerReservations.length) return
    const activeReservations = ownerReservations.filter(reservation => isReservationActive(reservation, now))
    if (activeReservations.length === ownerReservations.length) return
    setOwnerReservations(activeReservations)
    const nextAlley = { ...(ownerAlley || {}), reservations: activeReservations }
    setOwnerAlley(nextAlley)
    if (user) saveAlley(user.uid, nextAlley).catch(console.error)
  }, [now, ownerReservations, ownerAlley, user])

  const continueAsMember = async ({ user: authUser, fullName, email } = {}) => {
    setUser(authUser)
    const next = { ...member, name: fullName || authUser?.displayName || member.name, email: email || authUser?.email || member.email, role: 'member' }
    setMember(next)
    if (authUser) await saveAccount(authUser.uid, next)
    setPage('find-alley')
  }
  const activateMembership = async () => {
    setMember(current => ({ ...current, hasMembership: true, membershipAlleyId: current.membershipAlleyId ?? selectedAlley.id, membershipAlleyIds: [...new Set([...membershipAlleyIds(current).map(String), String(selectedAlley.id)])], selectedAlleyId: selectedAlley.id }))
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
    const savedReservation = { ...reservation, id: crypto.randomUUID(), alleyId: selectedAlley.id, alleyName: selectedAlley.name, createdAt: new Date().toISOString() }
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
  const selectAlley = alley => {
    setSelectedAlley(alley)
    setMember(current => ({ ...current, selectedAlleyId: alley.id }))
    setPage(hasMembershipAt(member, alley) ? 'member-dashboard' : 'alley-details')
  }
  const addOwnerProduct = async product => {
    const nextAlley = { ...(ownerAlley || { name: 'Your bowling alley' }), products: [...(ownerAlley?.products || []), product] }
    setOwnerAlley(nextAlley)
    if (user) await saveAlley(user.uid, nextAlley)
    setAvailableAlleys(current => current.map(alley => alley.ownerId === user?.uid || alley.name === nextAlley.name ? { ...alley, ...nextAlley } : alley))
  }
  const deleteOwnerProduct = async productId => {
    const nextAlley = { ...(ownerAlley || {}), products: (ownerAlley?.products || []).filter(product => product.id !== productId) }
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
  const addEmployeeReservation = async reservation => {
    const nextReservation = { ...reservation, createdAt: reservation.createdAt || new Date().toISOString(), date: reservation.date || new Date().toLocaleDateString('en-CA') }
    const reservations = [...ownerReservations, nextReservation]
    setOwnerReservations(reservations)
    setEmployeeAlley(current => ({ ...current, reservations }))
  }
  const addOwnerOrder = async order => saveOwnerAlleyUpdates({ orders: [...(ownerAlley?.orders || []), order] })
  const addEmployeeOrder = async order => {
    const ownerId = employeeAlley?.ownerId || employeeAlley?.id
    const orders = uniqueOrders([...(employeeAlley?.orders || []), order])
    setEmployeeAlley(current => ({ ...current, orders }))
    if (ownerId) localStorage.setItem(pendingOrdersKey(ownerId), JSON.stringify(uniqueOrders([...pendingEmployeeOrders(ownerId), order])))
  }
  const saveOwnerAlleyUpdates = async updates => {
    const nextAlley = { ...(ownerAlley || {}), ...updates }
    setOwnerAlley(nextAlley)
    if (user) await saveAlley(user.uid, nextAlley)
  }
  const addLeague = async league => saveOwnerAlleyUpdates({ leagues: [...(ownerAlley?.leagues || []), league] })
  const addLeagueMember = async (leagueId, leagueMember) => {
    const leagues = (ownerAlley?.leagues || []).map(league => league.id === leagueId ? { ...league, members: [...(league.members || []), leagueMember] } : league)
    await saveOwnerAlleyUpdates({ leagues })
  }
  const updateOwnerCredentials = async details => {
    const authUser = await updateLoginCredentials(details)
    const email = authUser.email || details.newEmail || member.email
    setMember(current => ({ ...current, email }))
    if (user) await saveAccount(user.uid, { email })
  }
  const cancelOwnerService = async () => {
    await saveOwnerAlleyUpdates({ serviceStatus: 'cancelled', cancelledAt: new Date().toISOString() })
    await logout()
  }

  const memberNav = active => <MemberBottomNav active={active} onSearch={() => setPage('find-alley')} onReservations={() => setPage('member-reservations')} onPurchase={() => setPage('member-store')} />
  const memberPage = (content, active) => <div className="with-bottom-nav">{content}{memberNav(active)}</div>
  const ownerNavProps = { onOverview: () => setPage('owner-dashboard'), onReservations: () => setPage('reservation-management'), onNewReservation: () => setPage('owner-walk-in-reservation'), onStore: () => setPage('owner-store'), onOrders: () => setPage('owner-orders') }
  const ownerPage = (content, active) => <div className="with-bottom-nav owner-account-page"><OwnerSettingsShortcut onClick={() => setPage('owner-settings')} />{content}<OwnerBottomNav {...ownerNavProps} active={active} /></div>
  const employeeLogout = () => { localStorage.removeItem('lane-club-employee-code'); setEmployeeAlley(null); setOwnerReservations([]); setPage('home') }
  const employeePage = (content, active) => <EmployeeWorkspace alley={employeeAlley} active={active} onReservations={() => setPage('employee-reservations')} onNewReservation={() => setPage('employee-add')} onStore={() => setPage('employee-store')} onOrders={() => setPage('employee-orders')} onLogout={employeeLogout}>{content}</EmployeeWorkspace>

  if (!authReady) return <main className="setup-page"><p className="notice">Loading Lane Club…</p></main>
  if (page === 'employee-login') return <EmployeeLoginPage onBack={() => setPage('home')} onContinue={foundAlley => { const alley = withPendingEmployeeOrders(foundAlley); localStorage.setItem('lane-club-employee-code', alley.employeeCode); setEmployeeAlley(alley); setOwnerReservations(Array.isArray(alley.reservations) ? alley.reservations : []); setPage('employee-reservations') }} />
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'member-auth-login') return <MemberAuthPage initialMode="login" onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={async ({ user: authUser, alleyName }) => { setUser(authUser); const existingAlley = await loadOwnerAlleyWithPendingOrders(authUser.uid); await saveAccount(authUser.uid, { name: authUser.displayName || 'Alley Owner', email: authUser.email, role: 'owner' }); setOwnerAlley(existingAlley || { name: alleyName }); setPage(existingAlley && existingAlley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') }} />
  if (page === 'owner-auth-login') return <OwnerAuthPage initialMode="login" onBack={() => setPage('home')} onContinue={async ({ user: authUser, alleyName }) => { setUser(authUser); const existingAlley = await loadOwnerAlleyWithPendingOrders(authUser.uid); await saveAccount(authUser.uid, { name: authUser.displayName || 'Alley Owner', email: authUser.email, role: 'owner' }); setOwnerAlley(existingAlley || { name: alleyName }); setPage(existingAlley && existingAlley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') }} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={async () => { if (ownerAlley?.name) { await saveOwnerAlleyUpdates({ serviceStatus: 'active', cancelledAt: null }); setPage('owner-dashboard') } else setPage('alley-setup') }} />
  if (page === 'alley-setup') return <AlleySetupPage initialAlley={ownerAlley} onBack={() => setPage('owner-checkout')} onComplete={async alley => { setOwnerAlley(alley); if (user) await saveAlley(user.uid, alley); setPage('owner-dashboard') }} />

  if (page === 'owner-dashboard') return ownerPage(<OwnerDashboardPage alley={ownerAlley} reservations={ownerReservations} now={now} />, 'overview')
  if (page === 'lane-management') return ownerPage(<LaneManagementPage onBack={() => setPage('owner-dashboard')} />, 'settings')
  if (page === 'reservation-management') return ownerPage(<ReservationManagementPage bookings={ownerReservations} alley={ownerAlley} now={now} />, 'reservations')
  if (page === 'owner-walk-in-reservation') return ownerPage(<OwnerWalkInReservationPage alley={ownerAlley} onBack={() => setPage('reservation-management')} onLeagueSignup={() => setPage('league-signup')} onComplete={async reservation => { await addOwnerReservation(reservation); setPage('reservation-management') }} />, 'new')
  if (page === 'league-signup') return ownerPage(<LeagueSignupPage alley={ownerAlley} onBack={() => setPage('owner-walk-in-reservation')} onPurchase={addLeagueMember} />, 'new')
  if (page === 'league-setup') return ownerPage(<LeagueSetupPage alley={ownerAlley} onBack={() => setPage('owner-settings')} onSaveLeague={addLeague} />, 'settings')
  if (page === 'owner-store') return ownerPage(<OwnerStorefrontPage alley={ownerAlley} onDashboard={() => setPage('owner-dashboard')} onPlaceOrder={addOwnerOrder} />, 'store')
  if (page === 'owner-store-edit') return ownerPage(<OwnerStorePage alley={ownerAlley} onAddProduct={addOwnerProduct} onDeleteProduct={deleteOwnerProduct} onAddCategory={addOwnerCategory} />, 'store')
  if (page === 'owner-orders') return ownerPage(<OrdersPage alley={ownerAlley} />, 'orders')
  if (page === 'owner-settings') return ownerPage(<OwnerSettingsPage alley={ownerAlley} email={member.email || user?.email || ''} onEditStore={() => setPage('owner-store-edit')} onLanes={() => setPage('lane-management')} onLeagueSetup={() => setPage('league-setup')} onSave={saveOwnerAlleyUpdates} onUpdateCredentials={updateOwnerCredentials} onCancelService={cancelOwnerService} onLogout={logout} />, '')

  if (employeeAlley && page === 'employee-reservations') return employeePage(<ReservationManagementPage bookings={ownerReservations} alley={employeeAlley} now={now} />, 'reservations')
  if (employeeAlley && page === 'employee-add') return employeePage(<OwnerWalkInReservationPage alley={employeeAlley} onLeagueSignup={() => setPage('employee-league-signup')} onComplete={async reservation => { await addEmployeeReservation(reservation); setPage('employee-reservations') }} />, 'new')
  if (employeeAlley && page === 'employee-league-signup') return employeePage(<LeagueSignupPage alley={employeeAlley} onBack={() => setPage('employee-add')} onPurchase={async (leagueId, leagueMember) => { const leagues = (employeeAlley.leagues || []).map(league => league.id === leagueId ? { ...league, members: [...(league.members || []), leagueMember] } : league); setEmployeeAlley(current => ({ ...current, leagues })); setPage('employee-add') }} />, 'new')
  if (employeeAlley && page === 'employee-store') return employeePage(<MemberStorePage alley={employeeAlley} onDashboard={() => setPage('employee-reservations')} onPlaceOrder={addEmployeeOrder} staffRole="employee" hideHeader />, 'store')
  if (employeeAlley && page === 'employee-orders') return employeePage(<OrdersPage alley={employeeAlley} />, 'orders')

  if (page === 'find-alley') return memberPage(<FindAlleyPage alleys={availableAlleys} onBack={() => setPage('member-dashboard')} onSelect={selectAlley} member={member} onAccount={() => setPage('member-settings')} onLogout={logout} />, 'search')
  if (page === 'alley-details') return memberPage(<AlleyDetailsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onJoin={() => hasActiveMembership() ? activateMembership() : setPage('member-checkout')} />, 'search')
  if (page === 'member-checkout') return memberPage(<MemberCheckoutPage alley={selectedAlley} onBack={() => setPage('alley-details')} onComplete={activateMembership} />, 'search')
  if (page === 'member-dashboard') return memberPage(<MemberDashboardPage alley={selectedAlley} now={now} onBack={() => setPage('find-alley')} onChangeAlley={() => setPage('find-alley')} onReserve={() => setPage('make-reservation')} onReservations={() => setPage('member-reservations')} onAccount={() => setPage('member-settings')} member={activeMember} />, '')
  if (page === 'member-reservations') return memberPage(<MemberReservationsPage alley={selectedAlley} member={activeMember} onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} onChangeAlley={() => setPage('find-alley')} />, 'reservations')
  if (page === 'member-store') return memberPage(<MemberStorePage alley={selectedAlley} onDashboard={() => setPage('member-dashboard')} onChangeAlley={() => setPage('find-alley')} />, 'purchase')
  if (page === 'make-reservation') return memberPage(<MakeReservationPage alley={selectedAlley} onBack={() => setPage('member-reservations')} onConfirm={addReservation} member={activeMember} />, 'reservations')
  if (page === 'reservation-confirmation') return memberPage(<ReservationConfirmationPage alley={selectedAlley} onDashboard={() => setPage('member-dashboard')} onReserve={() => setPage('make-reservation')} member={activeMember} />, 'reservations')
  if (page === 'member-settings') return memberPage(<MemberSettingsPage alley={selectedAlley} onBack={() => setPage('member-dashboard')} onLogout={logout} member={activeMember} onUpdate={updates => setMember(current => {
    if (updates.hasMembership === false) {
      const memberships = membershipAlleyIds(current).filter(id => String(id) !== String(selectedAlley.id))
      return { ...current, ...updates, membershipAlleyIds: memberships, hasMembership: memberships.length > 0 }
    }
    return { ...current, ...updates }
  })} />, '')
  return <LandingPage onNavigate={setPage} />
}
