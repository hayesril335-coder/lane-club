import { collection, doc, getDoc, getDocs, getDocsFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
import { firestore } from '../lib/firebaseClient'

export async function loadAccount(uid) {
  const snapshot = await getDoc(doc(firestore, 'users', uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function saveAccount(uid, data) {
  await setDoc(doc(firestore, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function loadAlley(uid) {
  const snapshot = await getDoc(doc(firestore, 'alleys', uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function saveAlley(uid, data) {
  await setDoc(doc(firestore, 'alleys', uid), { ...data, ownerId: uid, updatedAt: serverTimestamp() }, { merge: true })
}

export async function loadAlleys() {
  const snapshot = await getDocs(collection(firestore, 'alleys'))
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
}

export async function findAlleyByEmployeeCode(code) {
  const normalizedCode = String(code || '').replace(/\D/g, '')
  if (normalizedCode.length !== 10) return null
  let snapshot
  try { snapshot = await getDocsFromServer(collection(firestore, 'alleys')) } catch { snapshot = await getDocs(collection(firestore, 'alleys')) }
  const alleys = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
  return alleys.find(alley => String(alley.employeeCode || '') === normalizedCode) || null
}
