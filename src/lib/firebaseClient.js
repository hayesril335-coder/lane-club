import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCeiPwUPmHM99l5y5NpWUvHR8h_SCi0MlY',
  authDomain: 'lane-club.firebaseapp.com',
  projectId: 'lane-club',
  storageBucket: 'lane-club.firebasestorage.app',
  messagingSenderId: '525275878646',
  appId: '1:525275878646:web:095a7f60642d48fb4948d7',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null
