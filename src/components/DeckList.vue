<template>
  <div class="deck-list-container">
    <div class="deck-header">
      <h2 class="deck-list-title">My Decks</h2>
      <div class="header-actions">
        <q-btn
          unelevated
          class="community-btn"
          icon="explore"
          label="Community Decks"
          @click="$emit('browseCommunity')"
        />
        <q-btn
          unelevated
          class="create-deck-btn"
          icon="add"
          label="Create Deck"
          @click="showCreateDeckDialog = true"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="deckStore.loading" class="flex flex-center" style="min-height: 200px">
      <q-spinner color="primary" size="48px" />
    </div>

    <!-- Empty state -->
    <div v-else-if="deckStore.decks.length === 0" class="empty-state">
      <q-icon name="folder_open" size="80px" color="grey-5" />
      <h3 class="empty-title">No decks yet</h3>
      <p class="empty-description">Create your first deck to start learning!</p>
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Create Your First Deck"
        @click="showCreateDeckDialog = true"
        size="lg"
      />
    </div>

    <!-- Deck grid -->
    <div v-else class="deck-grid">
      <div v-for="deck in deckStore.decks" :key="deck.id" class="deck-card">
        <div class="deck-card-content" @click="openDeck(deck)">
          <div class="deck-icon">
            <q-icon name="style" size="32px" />
          </div>
          <div class="deck-name-row">
            <h3 class="deck-name">{{ deck.name }}</h3>
            <q-badge v-if="deck.isImported" color="green" class="imported-badge">
              <q-icon name="public" size="12px" style="margin-right: 4px" />
              <span>Imported</span>
            </q-badge>
          </div>
          <p v-if="deck.description" class="deck-description">{{ deck.description }}</p>
          <div class="deck-stats">
            <div class="stat">
              <q-icon name="layers" size="18px" />
              <span>{{ deck.cardCount }} cards</span>
            </div>
          </div>
        </div>

        <div class="deck-actions">
          <q-btn
            flat
            dense
            icon="edit"
            color="grey-7"
            @click.stop="editDeck(deck)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="delete"
            color="negative"
            @click.stop="confirmDeleteDeck(deck)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Create Deck Dialog -->
    <CreateDeckDialog v-model="showCreateDeckDialog" />

    <!-- Edit Deck Dialog -->
    <EditDeckDialog v-model="showEditDeckDialog" :deck="deckToEdit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeckStore } from '../stores/deck'
import { Deck } from '../types/deck'
import { Notify, Dialog } from 'quasar'
import CreateDeckDialog from './CreateDeckDialog.vue'
import EditDeckDialog from './EditDeckDialog.vue'

const deckStore = useDeckStore()
const showCreateDeckDialog = ref(false)
const showEditDeckDialog = ref(false)
const deckToEdit = ref<Deck | null>(null)

onMounted(async () => {
  await deckStore.loadDecks()
})

const emit = defineEmits<{
  openDeck: [deckId: string]
  browseCommunity: []
}>()

const openDeck = (deck: Deck) => {
  emit('openDeck', deck.id!)
}

const editDeck = (deck: Deck) => {
  deckToEdit.value = deck
  showEditDeckDialog.value = true
}

const confirmDeleteDeck = (deck: Deck) => {
  Dialog.create({
    title: 'Delete Deck',
    message: `Are you sure you want to delete "${deck.name}"? This will also delete all ${deck.cardCount} cards in this deck. This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deckStore.deleteDeck(deck.id!)
      Notify.create({
        type: 'positive',
        message: 'Deck deleted successfully',
        position: 'top',
      })
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: 'Failed to delete deck',
        position: 'top',
      })
    }
  })
}
</script>

<style scoped>
.deck-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.deck-list-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.community-btn {
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

.community-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.create-deck-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0;
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

.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.deck-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.deck-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
}

.deck-card-content {
  flex: 1;
  cursor: pointer;
}

.deck-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
}

.deck-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.deck-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.imported-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.deck-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.deck-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.deck-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .deck-list-container {
    padding: 1rem;
  }

  .deck-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .community-btn,
  .create-deck-btn {
    width: 100%;
    justify-content: center;
  }

  .deck-grid {
    grid-template-columns: 1fr;
  }
}
</style>
