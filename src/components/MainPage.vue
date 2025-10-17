<template>
  <div class="main-page">
    <!-- Show deck list, deck view, study session, or community decks -->
    <DeckList
      v-if="!selectedDeckId && !studyCards && !showCommunity"
      @open-deck="handleOpenDeck"
      @browse-community="handleBrowseCommunity"
    />
    <CommunityDecks
      v-else-if="showCommunity"
      @close="handleCloseCommunity"
    />
    <DeckView
      v-else-if="selectedDeckId && !studyCards"
      :deck-id="selectedDeckId"
      @back="handleBack"
      @start-study="handleStartStudy"
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
import { ref } from 'vue'
import DeckList from './DeckList.vue'
import DeckView from './DeckView.vue'
import StudySession from './StudySession.vue'
import CommunityDecks from './CommunityDecks.vue'
import { Card } from '../types/deck'
import { useDeckStore } from '../stores/deck'

const deckStore = useDeckStore()
const selectedDeckId = ref<string | null>(null)
const studyCards = ref<Card[] | null>(null)
const showCommunity = ref(false)

const handleOpenDeck = (deckId: string) => {
  selectedDeckId.value = deckId
  studyCards.value = null
}

const handleBack = () => {
  selectedDeckId.value = null
  studyCards.value = null
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
  showCommunity.value = true
}

const handleCloseCommunity = () => {
  showCommunity.value = false
  // Reload decks in case user imported any
  deckStore.loadDecks()
}
</script>

<style scoped>
.main-page {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
}
</style>
