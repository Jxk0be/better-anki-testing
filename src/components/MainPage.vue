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
import { ref } from 'vue'
import DeckList from './DeckList.vue'
import DeckView from './DeckView.vue'
import StudySession from './StudySession.vue'
import CommunityDecks from './CommunityDecks.vue'
import WeeklyCalendar from './WeeklyCalendar.vue'
import { Card } from '../types/deck'
import { useDeckStore } from '../stores/deck'

const deckStore = useDeckStore()
const selectedDeckId = ref<string | null>(null)
const studyCards = ref<Card[] | null>(null)
const showCommunity = ref(false)
const showCalendar = ref(false)

const handleOpenDeck = (deckId: string) => {
  selectedDeckId.value = deckId
  studyCards.value = null
  showCalendar.value = false
}

const handleBack = () => {
  selectedDeckId.value = null
  studyCards.value = null
  showCalendar.value = false
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

const handleOpenCalendar = () => {
  showCalendar.value = true
}

const handleBackFromCalendar = () => {
  showCalendar.value = false
}

const handleStartStudyFromCalendar = (card: Card) => {
  // Start studying with just this single card
  studyCards.value = [card]
  showCalendar.value = false
}
</script>

<style scoped>
.main-page {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
}
</style>
