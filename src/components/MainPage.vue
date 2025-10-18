<template>
  <div class="main-page">
    <!-- Show deck list, deck view, study session, community decks, or weekly calendar -->
    <DeckList
      v-if="!selectedDeckId && !studyCards && !showCommunity && !showCalendar"
      @open-deck="handleOpenDeck"
      @browse-community="handleBrowseCommunity"
    />
    <CommunityDecks
      v-else-if="showCommunity"
      @close="handleCloseCommunity"
    />
    <WeeklyCalendar
      v-else-if="showCalendar && selectedDeckId"
      :deck-id="selectedDeckId"
      @back="handleBackFromCalendar"
      @start-study="handleStartStudyFromCalendar"
    />
    <DeckView
      v-else-if="selectedDeckId && !studyCards && !showCalendar"
      :deck-id="selectedDeckId"
      @back="handleBack"
      @start-study="handleStartStudy"
      @open-calendar="handleOpenCalendar"
    />
    <StudySession
      v-else-if="studyCards"
      :cards="studyCards"
      @exit="handleExitStudy"
      @card-reviewed="handleCardReviewed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeckList from './DeckList.vue'
import DeckView from './DeckView.vue'
import StudySession from './StudySession.vue'
import CommunityDecks from './CommunityDecks.vue'
import WeeklyCalendar from './WeeklyCalendar.vue'
import { Card } from '../types/deck'
import { useDeckStore } from '../stores/deck'

const deckStore = useDeckStore()
const route = useRoute()
const router = useRouter()
const selectedDeckId = ref<string | null>(null)
const studyCards = ref<Card[] | null>(null)
const showCommunity = ref(false)
const showCalendar = ref(false)

// Watch route changes and update state
watch(() => route.path, () => {
  if (route.name === 'home') {
    selectedDeckId.value = null
    studyCards.value = null
    showCommunity.value = false
    showCalendar.value = false
  } else if (route.name === 'community') {
    showCommunity.value = true
    selectedDeckId.value = null
    studyCards.value = null
    showCalendar.value = false
  } else if (route.name === 'deck') {
    selectedDeckId.value = route.params.deckId as string
    studyCards.value = null
    showCommunity.value = false
    showCalendar.value = false
  } else if (route.name === 'calendar') {
    selectedDeckId.value = route.params.deckId as string
    showCalendar.value = true
    studyCards.value = null
    showCommunity.value = false
  }
}, { immediate: true })

const handleOpenDeck = (deckId: string) => {
  router.push({ name: 'deck', params: { deckId } })
}

const handleBack = () => {
  router.push({ name: 'home' })
}

const handleStartStudy = (cards: Card[]) => {
  studyCards.value = cards
}

const handleExitStudy = () => {
  studyCards.value = null
  // Reload deck to refresh card stats
  if (selectedDeckId.value) {
    deckStore.loadDeck(selectedDeckId.value)
  }
}

const handleCardReviewed = () => {
  // Optionally reload deck data after each card review
  // This keeps the stats up to date
  if (selectedDeckId.value) {
    deckStore.loadDeck(selectedDeckId.value)
  }
}

const handleBrowseCommunity = () => {
  router.push({ name: 'community' })
}

const handleCloseCommunity = () => {
  router.push({ name: 'home' })
  // Reload decks in case user imported any
  deckStore.loadDecks()
}

const handleOpenCalendar = () => {
  if (selectedDeckId.value) {
    router.push({ name: 'calendar', params: { deckId: selectedDeckId.value } })
  }
}

const handleBackFromCalendar = () => {
  if (selectedDeckId.value) {
    router.push({ name: 'deck', params: { deckId: selectedDeckId.value } })
  }
}

const handleStartStudyFromCalendar = (card: Card) => {
  // Start studying with just this single card
  studyCards.value = [card]
  showCalendar.value = false
}

// Reset to deck list view (exposed for parent components)
const resetToHome = () => {
  router.push({ name: 'home' })
}

// Expose resetToHome so parent can call it
defineExpose({
  resetToHome
})
</script>

<style scoped>
.main-page {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
}
</style>
