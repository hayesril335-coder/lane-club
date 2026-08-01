import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const productionHost = 'lane-club.vercel.app'
const isProductionHost = typeof window !== 'undefined' && window.location.hostname === productionHost

const firebaseConfig = {
  apiKey: 'AIzaSyCeiPwUPmHM99l5y5NpWUvHR8h_SCi0MlY',
  // Keep Firebase's auth helper on the same origin in production. Modern
  // browsers block the cross-site storage used by redirect sign-in.
  authDomain: isProductionHost ? productionHost : 'lane-club.firebaseapp.com',
  projectId: 'lane-club',
  storageBucket: 'lane-club.firebasestorage.app',
  messagingSenderId: '525275878646',
  appId: '1:525275878646:web:095a7f60642d48fb4948d7',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null
