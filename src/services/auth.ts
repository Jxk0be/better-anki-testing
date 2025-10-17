import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Google using a popup window
 * @returns Promise with UserCredential
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const auth = getFirebaseAuth()
  return await signInWithPopup(auth, googleProvider)
}

/**
 * Sign out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth()
  await firebaseSignOut(auth)
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth()
  return auth.currentUser
}

/**
 * Listen to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}
