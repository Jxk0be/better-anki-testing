import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { firebaseConfig } from '../config/firebase'

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { app, auth, db }
}

// Export initialized instances
export const getFirebaseApp = () => app
export const getFirebaseAuth = () => auth
export const getFirebaseDb = () => db
