import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
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
