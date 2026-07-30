import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCeiPwUPmHM99l5y5NpWUvHR8h_SCi0MlY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lane-club.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lane-club',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lane-club.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '525275878646',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:525275878646:web:095a7f60642d48fb4948d7',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null
