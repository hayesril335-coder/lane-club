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
import { hasMembershipAt, memberForAlley, membershipAlleyIds } from './utils/memberships'
import { reservationStartsAt } from './utils/reservations'
import { completeGoogleRedirect, observeAuthState, signInWithGoogleCredential, signOut, updateLoginCredentials } from './services/authService'
import { findAlleyByEmployeeCode, loadAccount, loadAlley, loadAlleys, saveAccount, saveAlley } from './services/accountService'
import { endAllSavedLeagueMemberships, endSavedLeagueMembership, generateLeaguePasswords, invalidateLeaguePasswords, joinLeagueWithPassword, loadLeagueMembers, validateLeaguePassword } from './services/leagueService'
import MemberLeagueJoinPage from './pages/MemberLeagueJoinPage'

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
const pendingReservationsKey = ownerId => `lane-club-employee-reservations-${ownerId}`
const uniqueOrders = orders => [...new Map(orders.map(order => [order.id, order])).values()]
const uniqueReservations = reservations => {
  const seen = new Set()
  return reservations.filter(reservation => {
    if (!reservation.id) return true
    if (seen.has(reservation.id)) return false
    seen.add(reservation.id)
    return true
  })
}
const pendingEmployeeOrders = ownerId => {
  try { return JSON.parse(localStorage.getItem(pendingOrdersKey(ownerId)) || '[]') } catch { return [] }
}
const pendingEmployeeReservations = ownerId => {
  try { return JSON.parse(localStorage.getItem(pendingReservationsKey(ownerId)) || '[]') } catch { return [] }
}
const withPendingEmployeeData = alley => {
  const ownerId = alley?.ownerId || alley?.id
  return !ownerId ? alley : {
    ...alley,
    orders: uniqueOrders([...(alley.orders || []), ...pendingEmployeeOrders(ownerId)]),
    reservations: uniqueReservations([...(alley.reservations || []), ...pendingEmployeeReservations(ownerId)]),
  }
}
const loadOwnerAlleyWithPendingOrders = async ownerId => {
  let alley = await loadAlley(ownerId)
  const savedLeagueMembers = await loadLeagueMembers(ownerId).catch(() => [])
  if (alley && savedLeagueMembers.length) {
    alley = { ...alley, leagues: (alley.leagues || []).map(league => ({ ...league, members: uniqueReservations([...(league.members || []), ...savedLeagueMembers.filter(member => member.leagueId === league.id)]) })) }
  }
  const queuedOrders = pendingEmployeeOrders(ownerId)
  const queuedReservations = pendingEmployeeReservations(ownerId)
  if (alley && (queuedOrders.length || queuedReservations.length)) {
    alley = {
      ...alley,
      orders: uniqueOrders([...(alley.orders || []), ...queuedOrders]),
      reservations: uniqueReservations([...(alley.reservations || []), ...queuedReservations]),
    }
    await saveAlley(ownerId, alley)
    localStorage.removeItem(pendingOrdersKey(ownerId))
    localStorage.removeItem(pendingReservationsKey(ownerId))
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
  const [selectedLeagueId, setSelectedLeagueId] = useState(null)
  const [leagueEntryPoint, setLeagueEntryPoint] = useState('settings')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const activeMember = memberForAlley(member, selectedAlley, now)
  const membershipAlleys = availableAlleys.filter(alley => hasMembershipAt(member, alley))

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
            const recoveredReservations = publicAlleys.flatMap(alley => (alley.reservations || []).filter(reservation => reservation.source === 'member' && (reservation.memberUid === authUser.uid || String(reservation.email || '').toLowerCase() === String(authUser.email || '').toLowerCase())).map(reservation => ({ ...reservation, alleyId: reservation.alleyId || alley.id || alley.ownerId, alleyName: reservation.alleyName || alley.name, lane: String(reservation.lane || '').replace(/^Lane\s*/i, '') })))
            const membershipStartedAtByAlley = { ...(account?.membershipStartedAtByAlley || {}) }
            memberships.forEach(alleyId => {
              const alleyKey = String(alleyId)
              if (membershipStartedAtByAlley[alleyKey]) return
              const earliestReservation = (account?.reservations || []).filter(reservation => String(reservation.alleyId ?? account?.membershipAlleyId ?? '') === alleyKey).map(reservation => reservation.createdAt).filter(Boolean).sort()[0]
              membershipStartedAtByAlley[alleyKey] = earliestReservation || account?.membershipStartedAt || new Date().toISOString()
            })
            account = { ...account, membershipAlleyIds: memberships, membershipStartedAtByAlley, reservations: uniqueReservations([...(account?.reservations || []), ...recoveredReservations]) }
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
            const alley = foundAlley ? withPendingEmployeeData(foundAlley) : null
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
    if (!employeeAlley) return undefined
    const validateEmployeeCode = async () => {
      const code = localStorage.getItem('lane-club-employee-code')
      if (!code) return
      try {
        const validAlley = await findAlleyByEmployeeCode(code)
        if (!validAlley) {
          localStorage.removeItem('lane-club-employee-code')
          setEmployeeAlley(null)
          setOwnerReservations([])
          setPage('home')
        }
      } catch (error) { console.warn('Employee code could not be revalidated.', error) }
    }
    const timer = window.setInterval(validateEmployeeCode, 30000)
    return () => window.clearInterval(timer)
  }, [employeeAlley, setPage])
  const continueAsMember = async ({ user: authUser, fullName, email } = {}) => {
    setUser(authUser)
    const next = { ...member, name: fullName || authUser?.displayName || member.name, email: email || authUser?.email || member.email, role: 'member' }
    setMember(next)
    if (authUser) await saveAccount(authUser.uid, next)
    setPage('find-alley')
  }
  const activateMembership = async () => {
    const startedAt = new Date().toISOString()
    setMember(current => ({ ...current, hasMembership: true, membershipAlleyId: current.membershipAlleyId ?? selectedAlley.id, membershipAlleyIds: [...new Set([...membershipAlleyIds(current).map(String), String(selectedAlley.id)])], membershipStartedAtByAlley: { ...(current.membershipStartedAtByAlley || {}), [String(selectedAlley.id)]: current.membershipStartedAtByAlley?.[String(selectedAlley.id)] || startedAt }, selectedAlleyId: selectedAlley.id }))
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
    if (!hasMembershipAt(member, selectedAlley)) throw new Error(`An active ${selectedAlley.name} membership is required to reserve a lane.`)
    const startsAt = reservationStartsAt(reservation)
    const savedReservation = { ...reservation, id: crypto.randomUUID(), alleyId: selectedAlley.id, alleyName: selectedAlley.name, ...(Number.isNaN(startsAt.getTime()) ? {} : { startsAt: startsAt.toISOString() }), createdAt: new Date().toISOString() }
    const nextMember = { ...member, reservations: [...(member.reservations || []), savedReservation] }
    setMember(nextMember)
    if (user) await saveAccount(user.uid, nextMember)
    setPage('reservation-confirmation')
    if (selectedAlley.ownerId) {
      try {
        const alley = await loadAlley(selectedAlley.ownerId)
        const ownerReservation = { ...savedReservation, memberUid: user?.uid || '', lane: `Lane ${String(reservation.lane).padStart(2, '0')}`, name: member.name, email: member.email, initials: member.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(), hours: `${reservation.duration} hours`, durationHours: reservation.duration, status: 'Confirmed', source: 'member', amount: 0 }
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
  const changeActiveAlley = alley => {
    setSelectedAlley(alley)
    setMember(current => ({ ...current, selectedAlleyId: alley.id }))
  }
  const startMemberReservation = () => setPage(hasMembershipAt(member, selectedAlley) ? 'make-reservation' : 'alley-details')
  const openMemberDashboard = () => {
    if (!hasMembershipAt(member, selectedAlley) && membershipAlleys.length) setSelectedAlley(membershipAlleys[0])
    setPage('member-dashboard')
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
    const reservations = uniqueReservations([...ownerReservations, nextReservation])
    setOwnerReservations(reservations)
    const nextAlley = { ...employeeAlley, reservations }
    setEmployeeAlley(nextAlley)
    const ownerId = employeeAlley?.ownerId || employeeAlley?.id
    if (!ownerId) throw new Error('This employee account is not connected to a saved alley.')
    localStorage.setItem(pendingReservationsKey(ownerId), JSON.stringify(uniqueReservations([...pendingEmployeeReservations(ownerId), nextReservation])))
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
    setAvailableAlleys(current => current.map(alley => alley.ownerId === user?.uid || alley.id === user?.uid ? { ...alley, ...updates } : alley))
  }
  const addLeague = async league => saveOwnerAlleyUpdates({ leagues: [...(ownerAlley?.leagues || []), league] })
  const addLeagueMember = async (leagueId, leagueMember) => {
    const leagues = (ownerAlley?.leagues || []).map(league => league.id === leagueId ? { ...league, members: [...(league.members || []), leagueMember] } : league)
    await saveOwnerAlleyUpdates({ leagues })
  }
  const deleteLeague = async leagueId => {
    const deletedAt = new Date().toISOString()
    const league = (ownerAlley?.leagues || []).find(item => item.id === leagueId)
    const archivedLeague = league ? {
      ...league,
      deletedAt,
      status: 'deleted',
      members: (league.members || []).map(leagueMember => ({ ...leagueMember, status: 'cancelled', active: false, endedAt: leagueMember.endedAt || deletedAt })),
    } : null
    if (user) await Promise.all([endAllSavedLeagueMemberships(user.uid, leagueId), invalidateLeaguePasswords(user.uid, leagueId)])
    await saveOwnerAlleyUpdates({
      leagues: (ownerAlley?.leagues || []).filter(item => item.id !== leagueId),
      deletedLeagues: archivedLeague ? [...(ownerAlley?.deletedLeagues || []), archivedLeague] : (ownerAlley?.deletedLeagues || []),
    })
    setSelectedLeagueId(null)
  }
  const updateLeague = async (leagueId, updates) => {
    const leagues = (ownerAlley?.leagues || []).map(league => league.id === leagueId ? { ...league, ...updates, updatedAt: new Date().toISOString() } : league)
    await saveOwnerAlleyUpdates({ leagues })
  }
  const endLeagueMembership = async (leagueId, memberId) => {
    const savedMember = (ownerAlley?.leagues || []).find(league => league.id === leagueId)?.members?.find(leagueMember => leagueMember.id === memberId)
    if (user && savedMember?.membershipDocId) await endSavedLeagueMembership(user.uid, savedMember.membershipDocId)
    const leagues = (ownerAlley?.leagues || []).map(league => league.id === leagueId ? {
      ...league,
      members: (league.members || []).map(leagueMember => leagueMember.id === memberId ? { ...leagueMember, status: 'cancelled', active: false, endedAt: new Date().toISOString() } : leagueMember),
    } : league)
    await saveOwnerAlleyUpdates({ leagues })
  }
  const createLeaguePasswords = async (leagueId, count) => {
    if (!user) throw new Error('Log in to the owner account to generate league passwords.')
    return generateLeaguePasswords(user.uid, leagueId, count)
  }
  const joinSelectedLeague = async code => {
    if (!user || !selectedLeague || !selectedAlley.ownerId) throw new Error('This league is not connected to an active alley owner.')
    const membership = await joinLeagueWithPassword({ ownerId: selectedAlley.ownerId, league: selectedLeague, code, user, member })
    setMember(current => ({ ...current, leagueMemberships: [...(current.leagueMemberships || []).filter(item => item.id !== membership.id), membership] }))
    return membership
  }
  const saveEmployeeAccess = async updates => {
    if (!user) throw new Error('Log in to the owner account before changing the employee code.')
    await saveAlley(user.uid, updates)
    const savedAlley = await loadAlley(user.uid)
    if (String(savedAlley?.employeeCode || '') !== String(updates.employeeCode || '')) throw new Error('Firebase did not confirm the new employee code. Please try again.')
    setOwnerAlley(current => ({ ...current, ...updates }))
    setAvailableAlleys(current => current.map(alley => alley.ownerId === user.uid || alley.id === user.uid ? { ...alley, ...updates } : alley))
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

  const memberNav = active => <MemberBottomNav active={active} onSearch={() => setPage('find-alley')} onDashboard={openMemberDashboard} onPurchase={() => setPage('member-store')} />
  const memberPage = (content, active) => <div className="with-bottom-nav">{content}{memberNav(active)}</div>
  const ownerNavProps = { onOverview: () => setPage('owner-dashboard'), onReservations: () => setPage('reservation-management'), onNewReservation: () => setPage('owner-walk-in-reservation'), onStore: () => setPage('owner-store'), onOrders: () => setPage('owner-orders') }
  const ownerPage = (content, active) => <div className="with-bottom-nav owner-account-page"><OwnerSettingsShortcut onClick={() => setPage('owner-settings')} />{content}<OwnerBottomNav {...ownerNavProps} active={active} /></div>
  const employeeLogout = () => { localStorage.removeItem('lane-club-employee-code'); setEmployeeAlley(null); setOwnerReservations([]); setPage('home') }
  const employeePage = (content, active) => <EmployeeWorkspace alley={employeeAlley} active={active} onReservations={() => setPage('employee-reservations')} onNewReservation={() => setPage('employee-add')} onStore={() => setPage('employee-store')} onOrders={() => setPage('employee-orders')} onLogout={employeeLogout}>{content}</EmployeeWorkspace>

  if (!authReady) return <main className="setup-page"><p className="notice">Loading Lane Club…</p></main>
  if (page === 'employee-login') return <EmployeeLoginPage onBack={() => setPage('home')} onContinue={foundAlley => { const alley = withPendingEmployeeData(foundAlley); localStorage.setItem('lane-club-employee-code', alley.employeeCode); setEmployeeAlley(alley); setOwnerReservations(Array.isArray(alley.reservations) ? alley.reservations : []); setPage('employee-reservations') }} />
  if (page === 'member-auth') return <MemberAuthPage onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'member-auth-login') return <MemberAuthPage initialMode="login" onBack={() => setPage('home')} onOwner={() => setPage('owner-auth')} onContinue={continueAsMember} />
  if (page === 'owner-auth') return <OwnerAuthPage onBack={() => setPage('home')} onContinue={async ({ user: authUser, alleyName }) => { setUser(authUser); const existingAlley = await loadOwnerAlleyWithPendingOrders(authUser.uid); await saveAccount(authUser.uid, { name: authUser.displayName || 'Alley Owner', email: authUser.email, role: 'owner' }); setOwnerAlley(existingAlley || { name: alleyName }); setPage(existingAlley && existingAlley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') }} />
  if (page === 'owner-auth-login') return <OwnerAuthPage initialMode="login" onBack={() => setPage('home')} onContinue={async ({ user: authUser, alleyName }) => { setUser(authUser); const existingAlley = await loadOwnerAlleyWithPendingOrders(authUser.uid); await saveAccount(authUser.uid, { name: authUser.displayName || 'Alley Owner', email: authUser.email, role: 'owner' }); setOwnerAlley(existingAlley || { name: alleyName }); setPage(existingAlley && existingAlley.serviceStatus !== 'cancelled' ? 'owner-dashboard' : 'owner-checkout') }} />
  if (page === 'owner-checkout') return <OwnerCheckoutPage onBack={() => setPage('owner-auth')} onContinue={async () => { if (ownerAlley?.name) { await saveOwnerAlleyUpdates({ serviceStatus: 'active', cancelledAt: null }); setPage('owner-dashboard') } else setPage('alley-setup') }} />
  if (page === 'alley-setup') return <AlleySetupPage initialAlley={ownerAlley} onBack={() => setPage('owner-checkout')} onComplete={async alley => { setOwnerAlley(alley); if (user) await saveAlley(user.uid, alley); setPage('owner-dashboard') }} />

  if (page === 'owner-dashboard') return ownerPage(<OwnerDashboardPage alley={ownerAlley} reservations={ownerReservations} now={now} onLeague={leagueId => { setSelectedLeagueId(leagueId); setLeagueEntryPoint('overview'); setPage('league-setup') }} />, 'overview')
  if (page === 'lane-management') return ownerPage(<LaneManagementPage onBack={() => setPage('owner-dashboard')} />, 'settings')
  if (page === 'reservation-management') return ownerPage(<ReservationManagementPage bookings={ownerReservations} alley={ownerAlley} now={now} />, 'reservations')
  if (page === 'owner-walk-in-reservation') return ownerPage(<OwnerWalkInReservationPage alley={ownerAlley} onBack={() => setPage('reservation-management')} onLeagueSignup={() => setPage('league-signup')} onComplete={async reservation => { await addOwnerReservation(reservation); setPage('reservation-management') }} />, 'new')
  if (page === 'league-signup') return ownerPage(<LeagueSignupPage alley={ownerAlley} onBack={() => setPage('owner-walk-in-reservation')} onPurchase={addLeagueMember} />, 'new')
  if (page === 'league-setup') return ownerPage(<LeagueSetupPage alley={ownerAlley} initialLeagueId={selectedLeagueId} managementOnly={leagueEntryPoint === 'overview'} onBack={() => { setSelectedLeagueId(null); setPage(leagueEntryPoint === 'overview' ? 'owner-dashboard' : 'owner-settings') }} onSaveLeague={addLeague} onUpdateLeague={updateLeague} onDeleteLeague={deleteLeague} onEndMembership={endLeagueMembership} onGeneratePasswords={createLeaguePasswords} />, 'settings')
  if (page === 'owner-store') return ownerPage(<OwnerStorefrontPage alley={ownerAlley} onDashboard={() => setPage('owner-dashboard')} onPlaceOrder={addOwnerOrder} />, 'store')
  if (page === 'owner-store-edit') return ownerPage(<OwnerStorePage alley={ownerAlley} onAddProduct={addOwnerProduct} onDeleteProduct={deleteOwnerProduct} onAddCategory={addOwnerCategory} />, 'store')
  if (page === 'owner-orders') return ownerPage(<OrdersPage alley={ownerAlley} />, 'orders')
  if (page === 'owner-settings') return ownerPage(<OwnerSettingsPage alley={ownerAlley} email={member.email || user?.email || ''} onBack={() => setPage('owner-dashboard')} onEditStore={() => setPage('owner-store-edit')} onLanes={() => setPage('lane-management')} onLeagueSetup={() => { setSelectedLeagueId(null); setLeagueEntryPoint('settings'); setPage('league-setup') }} onSave={saveOwnerAlleyUpdates} onSaveEmployeeCode={saveEmployeeAccess} onUpdateCredentials={updateOwnerCredentials} onCancelService={cancelOwnerService} onLogout={logout} />, '')

  if (employeeAlley && page === 'employee-reservations') return employeePage(<ReservationManagementPage bookings={ownerReservations} alley={employeeAlley} now={now} />, 'reservations')
  if (employeeAlley && page === 'employee-add') return employeePage(<OwnerWalkInReservationPage alley={employeeAlley} onLeagueSignup={() => setPage('employee-league-signup')} onComplete={async reservation => { await addEmployeeReservation(reservation); setPage('employee-reservations') }} />, 'new')
  if (employeeAlley && page === 'employee-league-signup') return employeePage(<LeagueSignupPage alley={employeeAlley} onBack={() => setPage('employee-add')} onPurchase={async (leagueId, leagueMember) => { const leagues = (employeeAlley.leagues || []).map(league => league.id === leagueId ? { ...league, members: [...(league.members || []), leagueMember] } : league); setEmployeeAlley(current => ({ ...current, leagues })); setPage('employee-add') }} />, 'new')
  if (employeeAlley && page === 'employee-store') return employeePage(<MemberStorePage alley={employeeAlley} onDashboard={() => setPage('employee-reservations')} onPlaceOrder={addEmployeeOrder} staffRole="employee" hideHeader />, 'store')
  if (employeeAlley && page === 'employee-orders') return employeePage(<OrdersPage alley={employeeAlley} />, 'orders')

  if (page === 'find-alley') return memberPage(<FindAlleyPage alleys={availableAlleys} onBack={() => setPage('member-dashboard')} onSelect={selectAlley} member={member} onAccount={() => setPage('member-settings')} onLogout={logout} />, 'search')
  if (page === 'membership-alleys') return memberPage(<FindAlleyPage alleys={membershipAlleys} onBack={() => setPage('member-dashboard')} onSelect={selectAlley} member={member} onAccount={() => setPage('member-settings')} onLogout={logout} />, '')
  if (page === 'alley-details') return memberPage(<AlleyDetailsPage alley={selectedAlley} onBack={() => setPage('find-alley')} onJoin={() => hasActiveMembership() ? activateMembership() : setPage('member-checkout')} onJoinLeague={league => { setSelectedLeague(league); setPage('member-league-join') }} />, 'search')
  if (page === 'member-checkout') return memberPage(<MemberCheckoutPage alley={selectedAlley} onBack={() => setPage('alley-details')} onComplete={activateMembership} />, 'search')
  if (page === 'member-league-join') return memberPage(<MemberLeagueJoinPage alley={selectedAlley} league={selectedLeague} member={member} onBack={() => setPage('alley-details')} onValidate={code => validateLeaguePassword(selectedAlley.ownerId, selectedLeague.id, code)} onPurchase={joinSelectedLeague} />, 'search')
  if (page === 'member-dashboard') return memberPage(<MemberDashboardPage alley={selectedAlley} membershipAlleys={membershipAlleys} now={now} onBack={() => setPage('find-alley')} onSelectAlley={changeActiveAlley} onReserve={startMemberReservation} onReservations={() => setPage('member-reservations')} onAccount={() => setPage('member-settings')} onLogout={logout} member={activeMember} />, 'dashboard')
  if (page === 'member-reservations') return memberPage(<MemberReservationsPage alley={selectedAlley} membershipAlleys={membershipAlleys} member={activeMember} onDashboard={openMemberDashboard} onReserve={startMemberReservation} onSelectAlley={changeActiveAlley} />, 'dashboard')
  if (page === 'member-store') return memberPage(<MemberStorePage alley={selectedAlley} membershipAlleys={membershipAlleys} member={member} onDashboard={() => setPage('member-dashboard')} onSelectAlley={changeActiveAlley} onAccount={() => setPage('member-settings')} onLogout={logout} />, 'purchase')
  if (page === 'make-reservation' && !hasMembershipAt(member, selectedAlley)) return memberPage(<AlleyDetailsPage alley={selectedAlley} onBack={() => setPage('find-alley')} onJoin={() => setPage('member-checkout')} onJoinLeague={league => { setSelectedLeague(league); setPage('member-league-join') }} />, 'search')
  if (page === 'make-reservation') return memberPage(<MakeReservationPage alley={selectedAlley} onBack={() => setPage('member-reservations')} onConfirm={addReservation} member={activeMember} />, 'dashboard')
  if (page === 'reservation-confirmation') return memberPage(<ReservationConfirmationPage alley={selectedAlley} onDashboard={openMemberDashboard} onReserve={startMemberReservation} member={activeMember} />, 'dashboard')
  if (page === 'member-settings') return memberPage(<MemberSettingsPage alley={selectedAlley} alleys={availableAlleys} onBack={() => setPage('member-dashboard')} onLogout={logout} member={member} onUpdatePassword={details => updateLoginCredentials(details)} onUpdate={updates => setMember(current => {
    if (updates.hasMembership === false) {
      const memberships = membershipAlleyIds(current).filter(id => String(id) !== String(selectedAlley.id))
      return { ...current, ...updates, membershipAlleyIds: memberships, hasMembership: memberships.length > 0 }
    }
    return { ...current, ...updates }
  })} />, '')
  return <LandingPage onNavigate={setPage} />
}
