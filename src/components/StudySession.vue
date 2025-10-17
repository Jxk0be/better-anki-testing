<template>
  <div class="study-session">
    <!-- Header -->
    <div class="study-header">
      <q-btn
        flat
        dense
        icon="close"
        color="white"
        @click="handleExit"
        size="md"
      >
        <q-tooltip>Exit Study</q-tooltip>
      </q-btn>
      <div class="study-progress">
        <span class="progress-text">{{ currentCardIndex + 1 }} / {{ cards.length }}</span>
        <q-linear-progress
          :value="progress"
          color="purple-4"
          class="q-mt-sm"
          size="6px"
        />
      </div>
    </div>

    <!-- No cards to study -->
    <div v-if="cards.length === 0" class="no-cards">
      <q-icon name="check_circle" size="80px" color="green-4" />
      <h2 class="no-cards-title">All done!</h2>
      <p class="no-cards-text">No cards to study right now. Great job!</p>
      <q-btn
        unelevated
        color="primary"
        label="Back to Deck"
        @click="$emit('exit')"
        size="lg"
      />
    </div>

    <!-- Study card -->
    <div v-else class="study-content">
      <div class="card-container" @click="flipCard">
        <div class="flashcard" :class="{ flipped: isFlipped }">
          <!-- Front of card -->
          <div class="card-face card-front" :class="{ hidden: isFlipped }">
            <div class="card-label">Question</div>
            <div class="card-text">{{ currentCard.title }}</div>
            <div class="flip-hint">
              <q-icon name="touch_app" size="24px" />
              <span>Tap to reveal answer</span>
            </div>
          </div>

          <!-- Back of card -->
          <div class="card-face card-back" :class="{ visible: isFlipped }">
            <div class="card-label">Answer</div>
            <div class="card-text">{{ currentCard.description }}</div>
          </div>
        </div>
      </div>

      <!-- Rating buttons (show once card has been flipped at least once) -->
      <div v-if="hasBeenFlipped" class="rating-buttons">
        <q-btn
          unelevated
          class="rating-btn rating-again"
          @click="rateCard(Rating.Again)"
          :loading="rating"
        >
          <div class="rating-info">
            <div class="rating-label">Again</div>
            <div class="rating-time">{{ getSchedulingTime(Rating.Again) }}</div>
          </div>
        </q-btn>

        <q-btn
          unelevated
          class="rating-btn rating-hard"
          @click="rateCard(Rating.Hard)"
          :loading="rating"
        >
          <div class="rating-info">
            <div class="rating-label">Hard</div>
            <div class="rating-time">{{ getSchedulingTime(Rating.Hard) }}</div>
          </div>
        </q-btn>

        <q-btn
          unelevated
          class="rating-btn rating-good"
          @click="rateCard(Rating.Good)"
          :loading="rating"
        >
          <div class="rating-info">
            <div class="rating-label">Good</div>
            <div class="rating-time">{{ getSchedulingTime(Rating.Good) }}</div>
          </div>
        </q-btn>

        <q-btn
          unelevated
          class="rating-btn rating-easy"
          @click="rateCard(Rating.Easy)"
          :loading="rating"
        >
          <div class="rating-info">
            <div class="rating-label">Easy</div>
            <div class="rating-time">{{ getSchedulingTime(Rating.Easy) }}</div>
          </div>
        </q-btn>
      </div>

      <!-- Navigation hint (only show when not flipped) -->
      <div v-else class="nav-hint">
        <p>Click the card to reveal the answer</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Card, Rating } from '../types/deck'
import { reviewAndSaveCard, getSchedulingInfo, formatDueTime } from '../services/fsrsService'
import { Notify } from 'quasar'

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  exit: []
  cardReviewed: []
}>()

const currentCardIndex = ref(0)
const isFlipped = ref(false)
const hasBeenFlipped = ref(false)
const rating = ref(false)
const schedulingInfo = ref<any>(null)

const currentCard = computed(() => props.cards[currentCardIndex.value])
const progress = computed(() => (currentCardIndex.value + 1) / props.cards.length)

onMounted(() => {
  updateSchedulingInfo()
  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const updateSchedulingInfo = () => {
  if (currentCard.value) {
    schedulingInfo.value = getSchedulingInfo(currentCard.value.fsrsData)
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
  if (isFlipped.value) {
    hasBeenFlipped.value = true
  }
}

const getSchedulingTime = (ratingValue: Rating): string => {
  if (!schedulingInfo.value) return ''
  const schedule = schedulingInfo.value[ratingValue]
  if (!schedule) return ''
  return formatDueTime(schedule.card)
}

const rateCard = async (ratingValue: Rating) => {
  try {
    rating.value = true
    await reviewAndSaveCard(currentCard.value, ratingValue)

    emit('cardReviewed')

    // Move to next card
    if (currentCardIndex.value < props.cards.length - 1) {
      currentCardIndex.value++
      isFlipped.value = false
      hasBeenFlipped.value = false
      updateSchedulingInfo()
    } else {
      // Finished all cards
      Notify.create({
        type: 'positive',
        message: 'Study session complete!',
        position: 'top',
      })
      emit('exit')
    }
  } catch (error) {
    console.error('Error rating card:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save rating',
      position: 'top',
    })
  } finally {
    rating.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (!isFlipped.value) {
    if (event.code === 'Space') {
      event.preventDefault()
      flipCard()
    }
  } else {
    // Rating shortcuts when flipped
    if (event.key === '1') rateCard(Rating.Again)
    else if (event.key === '2') rateCard(Rating.Hard)
    else if (event.key === '3') rateCard(Rating.Good)
    else if (event.key === '4') rateCard(Rating.Easy)
  }
}

const handleExit = () => {
  emit('exit')
}
</script>

<style scoped>
.study-session {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
}

.study-header {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.study-progress {
  flex: 1;
  max-width: 300px;
}

.progress-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.no-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.no-cards-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 1rem 0 0.5rem;
}

.no-cards-text {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.study-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 2rem;
}

.card-container {
  perspective: 1000px;
  width: 100%;
  max-width: 600px;
  height: 400px;
  cursor: pointer;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.card-front {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%),
              linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
  opacity: 1;
  transition: opacity 0.3s ease;
}

.card-front.hidden {
  opacity: 0;
  pointer-events: none;
}

.card-back {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(240, 147, 251, 0.2) 100%),
              linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
  transform: rotateY(180deg);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-back.visible {
  opacity: 1;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-text {
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  text-align: center;
  line-height: 1.5;
  word-wrap: break-word;
}

.flip-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.rating-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 700px;
}

.rating-btn {
  padding: 1.5rem 1rem;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  transition: all 0.2s ease;
}

.rating-btn:hover {
  transform: translateY(-2px);
}

.rating-again {
  background: #ef4444;
  color: white;
}

.rating-hard {
  background: #f59e0b;
  color: white;
}

.rating-good {
  background: #10b981;
  color: white;
}

.rating-easy {
  background: #3b82f6;
  color: white;
}

.rating-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.rating-label {
  font-size: 1rem;
  font-weight: 700;
}

.rating-time {
  font-size: 0.75rem;
  opacity: 0.9;
}

.nav-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .study-header {
    padding: 1rem;
  }

  .study-content {
    padding: 1rem;
  }

  .card-container {
    height: 300px;
  }

  .card-face {
    padding: 2rem;
  }

  .card-text {
    font-size: 1.25rem;
  }

  .rating-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
