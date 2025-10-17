import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User } from 'firebase/auth'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  onAuthStateChange,
} from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => user.value !== null)
  const userDisplayName = computed(() => user.value?.displayName || 'User')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')

  // Initialize auth state listener
  const initAuth = () => {
    loading.value = true
    onAuthStateChange((newUser) => {
      user.value = newUser
      loading.value = false
    })
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = null
      loading.value = true
      const result = await firebaseSignInWithGoogle()
      user.value = result.user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign in'
      console.error('Sign in error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      error.value = null
      loading.value = true
      await firebaseSignOut()
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign out'
      console.error('Sign out error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    loading,
    error,
    // Computed
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    // Actions
    initAuth,
    signInWithGoogle,
    signOut,
  }
})
