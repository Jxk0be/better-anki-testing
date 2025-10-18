<template>
  <div class="auth-button">
    <!-- Loading state -->
    <q-spinner v-if="authStore.loading" color="white" size="24px" />

    <!-- Authenticated state -->
    <div v-else-if="authStore.isAuthenticated" class="flex items-center gap-2">
      <q-avatar size="32px">
        <img
          v-if="authStore.userPhotoURL"
          :src="authStore.userPhotoURL"
          :alt="authStore.userDisplayName"
          referrerpolicy="no-referrer"
        />
        <q-icon v-else name="person" color="white" />
      </q-avatar>
      <span class="hidden sm:inline text-white">{{ authStore.userDisplayName }}</span>
      <q-btn
        flat
        dense
        icon="logout"
        color="white"
        @click="handleSignOut"
        :loading="signingOut"
      >
        <q-tooltip>Sign Out</q-tooltip>
      </q-btn>
    </div>

    <!-- Not authenticated state -->
    <q-btn
      v-else
      flat
      label="Sign in with Google"
      icon="login"
      color="white"
      @click="handleSignIn"
      :loading="signingIn"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Notify } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const signingIn = ref(false)
const signingOut = ref(false)

const handleSignIn = async () => {
  try {
    signingIn.value = true
    await authStore.signInWithGoogle()
    Notify.create({
      type: 'positive',
      message: 'Successfully signed in!',
      position: 'top',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to sign in. Please try again.',
      position: 'top',
    })
  } finally {
    signingIn.value = false
  }
}

const handleSignOut = async () => {
  try {
    signingOut.value = true
    await authStore.signOut()
    // Navigate to home route after logout
    router.push({ name: 'home' })
    Notify.create({
      type: 'positive',
      message: 'Successfully signed out!',
      position: 'top',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Failed to sign out. Please try again.',
      position: 'top',
    })
  } finally {
    signingOut.value = false
  }
}
</script>

<style scoped>
.auth-button {
  display: flex;
  align-items: center;
}
</style>
