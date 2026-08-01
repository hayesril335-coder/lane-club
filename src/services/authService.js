import { browserLocalPersistence, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithCredential, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth'
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

export async function signInWithGoogleCredential(idToken, role = 'member') {
  await setPersistence(firebaseAuth, browserLocalPersistence)
  const credential = GoogleAuthProvider.credential(idToken)
  const result = await signInWithCredential(firebaseAuth, credential)
  return { user: result.user, role }
}

export async function completeGoogleRedirect() {
  return getRedirectResult(firebaseAuth)
}

export function observeAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback)
}
