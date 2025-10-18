<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="custom-header">
      <q-toolbar class="custom-toolbar">
        <q-toolbar-title class="toolbar-title">
          <span class="app-name" @click="handleLogoClick">Better Anki</span>
        </q-toolbar-title>
        <q-space />
        <AuthButton />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page>
        <!-- Show landing page for non-authenticated users -->
        <LandingPage v-if="!authStore.isAuthenticated && !authStore.loading" />

        <!-- Show main page for authenticated users -->
        <MainPage v-if="authStore.isAuthenticated" ref="mainPageRef" />

        <!-- Show loading state while checking auth -->
        <div v-if="authStore.loading" class="flex flex-center" style="min-height: calc(100vh - 50px)">
          <q-spinner color="primary" size="64px" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import AuthButton from './components/AuthButton.vue'
import LandingPage from './components/LandingPage.vue'
import MainPage from './components/MainPage.vue'

const authStore = useAuthStore()
const mainPageRef = ref<InstanceType<typeof MainPage> | null>(null)

// Initialize auth state listener on mount
onMounted(() => {
  authStore.initAuth()
})

// Handle logo click to reset to home view
const handleLogoClick = () => {
  if (authStore.isAuthenticated && mainPageRef.value) {
    mainPageRef.value.resetToHome()
  }
}
</script>

<style scoped>
.custom-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.custom-toolbar {
  min-height: 64px;
  padding: 0 1.5rem;
}

.toolbar-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.app-name {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.app-name:hover {
  opacity: 0.8;
}
</style>
