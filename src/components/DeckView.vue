<template>
  <div class="deck-view-container">
    <!-- Loading state -->
    <div v-if="deckStore.loading" class="flex flex-center" style="min-height: 400px">
      <q-spinner color="primary" size="48px" />
    </div>

    <!-- Deck loaded -->
    <div v-else-if="deckStore.currentDeck">
      <!-- Header -->
      <div class="deck-view-header">
        <div class="header-left">
          <q-btn
            flat
            dense
            icon="arrow_back"
            color="white"
            @click="$emit('back')"
            size="md"
          >
            <q-tooltip>Back to decks</q-tooltip>
          </q-btn>
          <div class="deck-info">
            <h2 class="deck-title">{{ deckStore.currentDeck.name }}</h2>
            <p v-if="deckStore.currentDeck.description" class="deck-subtitle">
              {{ deckStore.currentDeck.description }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn
            v-if="!deckStore.currentDeck.isImported"
            flat
            dense
            :icon="isPublished ? 'cloud_done' : 'cloud_upload'"
            :color="isPublished ? 'green' : 'white'"
            @click="togglePublish"
            :loading="publishing"
          >
            <q-tooltip>{{ isPublished ? 'Published to Community' : 'Publish to Community' }}</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            class="calendar-btn"
            icon="event_note"
            label="Weekly View"
            @click="$emit('openCalendar')"
          >
            <q-tooltip>View 7-day calendar</q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            class="add-card-btn"
            icon="add"
            label="Add Card"
            @click="showAddCardDialog = true"
          />
        </div>
      </div>

      <!-- Cards stats -->
      <div class="cards-stats">
        <div class="stat-card">
          <q-icon name="layers" size="24px" color="purple-4" />
          <div class="stat-info">
            <div class="stat-value">{{ deckStore.currentDeckCards.length }}</div>
            <div class="stat-label">Total Cards</div>
          </div>
        </div>
        <div class="stat-card">
          <q-icon name="schedule" size="24px" color="orange-4" />
          <div class="stat-info">
            <div class="stat-value">{{ dueCardsCount }}</div>
            <div class="stat-label">Due Now</div>
          </div>
        </div>
      </div>

      <!-- Study Button -->
      <div v-if="deckStore.currentDeckCards.length > 0" class="study-section">
        <q-btn
          unelevated
          size="lg"
          class="study-btn"
          icon="play_arrow"
          :label="dueCardsCount > 0 ? `Study ${dueCardsCount} Cards` : 'Study All Cards'"
          @click="startStudy"
        />
      </div>

      <!-- Empty state -->
      <div v-if="deckStore.currentDeckCards.length === 0" class="empty-state">
        <q-icon name="note_add" size="80px" color="grey-5" />
        <h3 class="empty-title">No cards yet</h3>
        <p class="empty-description">Add your first card to start learning!</p>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Add Your First Card"
          @click="showAddCardDialog = true"
          size="lg"
        />
      </div>

      <!-- Cards list -->
      <div v-else class="cards-list">
        <div v-for="card in deckStore.currentDeckCards" :key="card.id" class="card-item">
          <div class="card-content">
            <div class="card-front">
              <div class="card-label">Front</div>
              <div class="card-text">{{ card.title }}</div>
            </div>
            <q-icon name="arrow_forward" size="20px" color="grey-6" class="card-arrow" />
            <div class="card-back">
              <div class="card-label">Back</div>
              <div class="card-text">{{ card.description }}</div>
            </div>
          </div>

          <div class="card-meta">
            <div class="card-status">
              <q-badge
                :color="isCardDue(card) ? 'orange' : 'green'"
                :label="getCardStatus(card)"
              />
            </div>
            <div class="card-actions">
              <q-btn
                flat
                dense
                icon="edit"
                color="primary"
                @click="openEditDialog(card)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="delete"
                color="negative"
                @click="confirmDeleteCard(card)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Card Dialog -->
    <AddCardDialog
      v-if="deckStore.currentDeck && deckStore.currentDeck.id"
      v-model="showAddCardDialog"
      :deck-id="deckStore.currentDeck.id"
    />

    <!-- Edit Card Dialog -->
    <EditCardDialog
      v-if="cardToEdit"
      v-model="showEditCardDialog"
      :card="cardToEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDeckStore } from '../stores/deck'
import { useAuthStore } from '../stores/auth'
import { Card } from '../types/deck'
import { isCardDue, formatDueTime } from '../services/fsrsService'
import { publishDeckToCommunity, unpublishDeck, isDeckPublished } from '../services/communityService'
import { Notify, Dialog } from 'quasar'
import AddCardDialog from './AddCardDialog.vue'
import EditCardDialog from './EditCardDialog.vue'

const props = defineProps<{
  deckId: string
}>()

const emit = defineEmits<{
  back: []
  startStudy: [cards: Card[]]
  openCalendar: []
}>()

const deckStore = useDeckStore()
const authStore = useAuthStore()
const showAddCardDialog = ref(false)
const showEditCardDialog = ref(false)
const cardToEdit = ref<Card | null>(null)
const isPublished = ref(false)
const publishing = ref(false)

const dueCardsCount = computed(() => {
  return deckStore.currentDeckCards.filter((card) => isCardDue(card.fsrsData)).length
})

onMounted(async () => {
  await deckStore.loadDeck(props.deckId)
  // Check if deck is published
  if (deckStore.currentDeck && authStore.user) {
    isPublished.value = await isDeckPublished(props.deckId, authStore.user.uid)
  }
})

const startStudy = () => {
  // Study due cards first, or all cards if no due cards
  const cardsToStudy = dueCardsCount.value > 0
    ? deckStore.currentDeckCards.filter((card) => isCardDue(card.fsrsData))
    : deckStore.currentDeckCards

  if (cardsToStudy.length === 0) {
    Notify.create({
      type: 'info',
      message: 'No cards to study',
      position: 'top',
    })
    return
  }

  emit('startStudy', cardsToStudy)
}

const togglePublish = async () => {
  if (!deckStore.currentDeck || !authStore.user) return

  try {
    publishing.value = true

    if (isPublished.value) {
      // Unpublish
      await unpublishDeck(props.deckId, authStore.user.uid)
      isPublished.value = false
      Notify.create({
        type: 'positive',
        message: 'Deck unpublished from community',
        position: 'top',
      })
    } else {
      // Publish
      await publishDeckToCommunity(deckStore.currentDeck, authStore.userDisplayName)
      isPublished.value = true
      Notify.create({
        type: 'positive',
        message: 'Deck published to community!',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error toggling publish:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to update publish status',
      position: 'top',
    })
  } finally {
    publishing.value = false
  }
}

const getCardStatus = (card: Card): string => {
  return formatDueTime(card.fsrsData)
}

const openEditDialog = (card: Card) => {
  cardToEdit.value = card
  showEditCardDialog.value = true
}

const confirmDeleteCard = (card: Card) => {
  Dialog.create({
    title: 'Delete Card',
    message: `Are you sure you want to delete this card? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deckStore.deleteCard(card.id!)
      Notify.create({
        type: 'positive',
        message: 'Card deleted successfully',
        position: 'top',
      })
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: 'Failed to delete card',
        position: 'top',
      })
    }
  })
}
</script>

<style scoped>
.deck-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.deck-view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.deck-info {
  flex: 1;
}

.deck-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.deck-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.3s ease;
}

.calendar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.add-card-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0;
}

.cards-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 1rem 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
}

.card-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1rem;
}

.card-front,
.card-back {
  min-width: 0;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 1rem;
  color: white;
  line-height: 1.5;
  word-wrap: break-word;
}

.card-arrow {
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-status {
  display: flex;
  gap: 0.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.study-section {
  margin-bottom: 2rem;
  text-align: center;
}

.study-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .deck-view-container {
    padding: 1rem;
  }

  .deck-view-header {
    flex-direction: column;
  }

  .header-left {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .calendar-btn,
  .add-card-btn {
    width: 100%;
    justify-content: center;
  }

  .card-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-arrow {
    display: none;
  }

  .deck-title {
    font-size: 1.5rem;
  }
}
</style>
