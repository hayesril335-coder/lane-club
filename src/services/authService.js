import { browserLocalPersistence, createUserWithEmailAndPassword, EmailAuthProvider, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, setPersistence, signInWithCredential, signInWithEmailAndPassword, signOut as firebaseSignOut, updateEmail, updatePassword, updateProfile } from 'firebase/auth'
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

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw new Error('Enter the email address for your Lane Club account.')
  await sendPasswordResetEmail(firebaseAuth, normalizedEmail)
}

export async function updateLoginCredentials({ currentPassword, newEmail, newPassword }) {
  const user = firebaseAuth.currentUser
  if (!user?.email) throw new Error('No signed-in email account was found.')
  const usesPassword = user.providerData.some(provider => provider.providerId === 'password')
  if (!usesPassword) throw new Error('This account uses Google sign-in. Manage its email and password through Google.')
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
  if (newPassword) await updatePassword(user, newPassword)
  if (newEmail && newEmail !== user.email) await updateEmail(user, newEmail)
  return user
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
