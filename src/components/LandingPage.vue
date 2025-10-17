<template>
  <div class="landing-page">
    <div class="landing-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-badge">
          <q-icon name="star" size="16px" />
          <span>Powered by FSRS Algorithm</span>
        </div>

        <h1 class="hero-title">
          Master Anything with
          <span class="gradient-text">Better Anki</span>
        </h1>

        <p class="hero-subtitle">
          Transform your learning with intelligent spaced repetition.
          Study smarter, remember longer.
        </p>

        <q-btn
          unelevated
          size="lg"
          class="cta-button"
          @click="handleSignIn"
          :loading="signingIn"
        >
          <q-icon name="login" size="24px" class="q-mr-sm" />
          <span>Sign in with Google</span>
        </q-btn>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="feature-card">
          <div class="feature-icon">
            <q-icon name="psychology" size="40px" />
          </div>
          <h3 class="feature-title">Smart Learning</h3>
          <p class="feature-description">
            Adaptive algorithm learns your memory patterns for optimal review timing
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <q-icon name="cloud_sync" size="40px" />
          </div>
          <h3 class="feature-title">Cloud Sync</h3>
          <p class="feature-description">
            Seamlessly sync across all devices with real-time updates
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <q-icon name="insights" size="40px" />
          </div>
          <h3 class="feature-title">Track Progress</h3>
          <p class="feature-description">
            Visualize your learning journey with detailed analytics
          </p>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Notify } from 'quasar'

const authStore = useAuthStore()
const signingIn = ref(false)

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
</script>

<style scoped>
.landing-page {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
  position: relative;
  overflow: hidden;
}

.landing-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 3rem 0 4rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.cta-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.5);
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 5rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
}

.feature-description {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

/* Decorative Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #667eea;
  top: -200px;
  left: -100px;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: #764ba2;
  bottom: -250px;
  right: -150px;
  animation-delay: -5s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: #f093fb;
  top: 50%;
  right: 10%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 30px) scale(0.9);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .landing-content {
    padding: 2rem 1rem;
  }

  .hero-section {
    padding: 2rem 0 3rem;
  }

  .features-section {
    gap: 1.5rem;
    margin-top: 3rem;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>
