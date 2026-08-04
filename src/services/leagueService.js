import { collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { firestore } from '../lib/firebaseClient'

const createCode = () => Array.from(crypto.getRandomValues(new Uint32Array(10)), value => value % 10).join('')

export async function generateLeaguePasswords(ownerId, leagueId, count) {
  const total = Math.min(100, Math.max(1, Number(count) || 1))
  const codes = new Set()
  while (codes.size < total) codes.add(createCode())
  const batch = writeBatch(firestore)
  const createdAt = new Date().toISOString()
  codes.forEach(code => batch.set(doc(firestore, 'alleys', ownerId, 'leagueCodes', code), { code, ownerId, leagueId, used: false, createdAt }))
  await batch.commit()
  return [...codes]
}

export async function validateLeaguePassword(ownerId, leagueId, code) {
  const normalized = String(code || '').replace(/\D/g, '')
  if (normalized.length !== 10) throw new Error('Enter the 10-digit league password.')
  const snapshot = await getDoc(doc(firestore, 'alleys', ownerId, 'leagueCodes', normalized))
  if (!snapshot.exists() || snapshot.data().leagueId !== leagueId) throw new Error('That password is not valid for this league.')
  if (snapshot.data().used) throw new Error('That password has already been used.')
  return normalized
}

export async function joinLeagueWithPassword({ ownerId, league, code, user, member }) {
  const normalized = String(code || '').replace(/\D/g, '')
  if (normalized.length !== 10) throw new Error('Enter the 10-digit league password.')
  const codeRef = doc(firestore, 'alleys', ownerId, 'leagueCodes', normalized)
  const membershipRef = doc(firestore, 'alleys', ownerId, 'leagueMembers', `${user.uid}_${normalized}`)
  const alleyRef = doc(firestore, 'alleys', ownerId)
  await runTransaction(firestore, async transaction => {
    const [codeSnapshot, alleySnapshot] = await Promise.all([transaction.get(codeRef), transaction.get(alleyRef)])
    if (!alleySnapshot.exists() || !(alleySnapshot.data().leagues || []).some(item => item.id === league.id)) throw new Error('This league is no longer available.')
    if (!codeSnapshot.exists() || codeSnapshot.data().leagueId !== league.id) throw new Error('That password is not valid for this league.')
    if (codeSnapshot.data().used) throw new Error('That password has already been used.')
    transaction.update(codeRef, { used: true, usedBy: user.uid, usedAt: serverTimestamp() })
    transaction.set(membershipRef, {
      id: membershipRef.id,
      userId: user.uid,
      ownerId,
      leagueId: league.id,
      code: normalized,
      name: member.name,
      email: member.email || user.email || '',
      phone: member.phone || '',
      monthlyPrice: Number(league.monthlyPrice || 0),
      status: 'active',
      active: true,
      joinedAt: serverTimestamp(),
    })
  })
  return { id: membershipRef.id, leagueId: league.id, ownerId, name: league.name, monthlyPrice: Number(league.monthlyPrice || 0), status: 'active' }
}

export async function loadLeagueMembers(ownerId) {
  const snapshot = await getDocs(collection(firestore, 'alleys', ownerId, 'leagueMembers'))
  return snapshot.docs.map(item => ({ membershipDocId: item.id, ...item.data() }))
}

export async function endSavedLeagueMembership(ownerId, membershipDocId) {
  if (!membershipDocId) return
  await updateDoc(doc(firestore, 'alleys', ownerId, 'leagueMembers', membershipDocId), { status: 'cancelled', active: false, endedAt: serverTimestamp() })
}

export async function endAllSavedLeagueMemberships(ownerId, leagueId) {
  const memberships = await loadLeagueMembers(ownerId)
  const active = memberships.filter(member => member.leagueId === leagueId && member.status !== 'cancelled' && member.active !== false)
  if (!active.length) return
  const batch = writeBatch(firestore)
  active.forEach(member => batch.update(doc(firestore, 'alleys', ownerId, 'leagueMembers', member.membershipDocId), { status: 'cancelled', active: false, endedAt: serverTimestamp() }))
  await batch.commit()
}

export async function invalidateLeaguePasswords(ownerId, leagueId) {
  const snapshot = await getDocs(collection(firestore, 'alleys', ownerId, 'leagueCodes'))
  const matching = snapshot.docs.filter(item => item.data().leagueId === leagueId)
  if (!matching.length) return
  const batch = writeBatch(firestore)
  matching.forEach(item => batch.delete(item.ref))
  await batch.commit()
}
