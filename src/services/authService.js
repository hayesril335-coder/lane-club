import { browserLocalPersistence, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithRedirect, signOut as firebaseSignOut, updateProfile } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebaseClient'

export async function signUp({ email, password, fullName, role = 'member' }) {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  await updateProfile(credential.user, { displayName: fullName })
  return { user: credential.user, role }
}

export async function signIn({ email, password }) {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return { user: credential.user }
}

export async function signOut() {
  return firebaseSignOut(firebaseAuth)
}

export async function signInWithGoogle(role = 'member') {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  localStorage.setItem('lane-club-google-role', role)
  await signInWithRedirect(firebaseAuth, provider)
  return { redirecting: true }
}

export async function completeGoogleRedirect() {
  return getRedirectResult(firebaseAuth)
}

export function observeAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback)
}
