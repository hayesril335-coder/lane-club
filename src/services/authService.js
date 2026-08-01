import { browserLocalPersistence, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut, updateProfile } from 'firebase/auth'
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
  sessionStorage.setItem('lane-club-google-role', role)
  const provider = new GoogleAuthProvider()
  const mobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768
  if (mobileBrowser) {
    await signInWithRedirect(firebaseAuth, provider)
    return { redirecting: true }
  }
  try {
    const credential = await signInWithPopup(firebaseAuth, provider)
    return { user: credential.user }
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(firebaseAuth, provider)
      return { redirecting: true }
    }
    throw error
  }
}

export function observeAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback)
}
