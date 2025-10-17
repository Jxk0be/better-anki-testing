<template>
  <div class="community-decks-container">
    <div class="community-header">
      <div>
        <h2 class="community-title">Community Decks</h2>
        <p class="community-subtitle">Discover and import decks shared by other users</p>
      </div>
      <div class="header-actions">
        <q-btn
          flat
          :color="showMyDecksOnly ? 'primary' : 'white'"
          :icon="showMyDecksOnly ? 'person' : 'person_outline'"
          label="My Decks Only"
          @click="showMyDecksOnly = !showMyDecksOnly"
        >
          <q-tooltip>{{ showMyDecksOnly ? 'Show All Decks' : 'Show Only My Published Decks' }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="close"
          color="white"
          @click="$emit('close')"
          size="md"
        >
          <q-tooltip>Back to My Decks</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-center" style="min-height: 200px">
      <q-spinner color="primary" size="48px" />
    </div>

    <!-- Empty state -->
    <div v-else-if="communityDecks.length === 0" class="empty-state">
      <q-icon name="explore_off" size="80px" color="grey-5" />
      <h3 class="empty-title">No community decks yet</h3>
      <p class="empty-description">Be the first to share your deck with the community!</p>
    </div>

    <!-- Community decks grid -->
    <div v-else class="decks-grid">
      <div v-for="deck in filteredDecks" :key="deck.id" class="community-deck-card">
        <div class="deck-content">
          <div class="deck-icon">
            <q-icon name="public" size="32px" />
          </div>
          <h3 class="deck-name">{{ deck.name }}</h3>
          <p v-if="deck.description" class="deck-description">{{ deck.description }}</p>

          <div class="deck-meta">
            <div class="meta-item">
              <q-icon name="person" size="16px" />
              <span>{{ deck.authorName }}</span>
            </div>
            <div class="meta-item">
              <q-icon name="layers" size="16px" />
              <span>{{ deck.cardCount }} cards</span>
            </div>
            <div class="meta-item">
              <q-icon name="download" size="16px" />
              <span>{{ deck.importCount }} imports</span>
            </div>
          </div>
        </div>

        <div class="deck-actions">
          <q-btn
            v-if="isMyDeck(deck)"
            unelevated
            class="unpublish-btn"
            icon="cloud_off"
            label="Unpublish"
            @click="confirmUnpublish(deck)"
            :loading="unpublishing === deck.id"
          />
          <q-btn
            v-else-if="isAlreadyImported(deck)"
            unelevated
            class="imported-btn"
            icon="check_circle"
            label="Already Imported"
            disable
          />
          <q-btn
            v-else
            unelevated
            class="import-btn"
            icon="add"
            label="Import Deck"
            @click="confirmImport(deck)"
            :loading="importing === deck.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CommunityDeck } from '../types/deck'
import { getCommunityDecks, importCommunityDeck, unpublishDeck } from '../services/communityService'
import { useAuthStore } from '../stores/auth'
import { useDeckStore } from '../stores/deck'
import { Notify, Dialog } from 'quasar'

defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const deckStore = useDeckStore()
const communityDecks = ref<CommunityDeck[]>([])
const loading = ref(true)
const importing = ref<string | null>(null)
const unpublishing = ref<string | null>(null)
const showMyDecksOnly = ref(false)

onMounted(async () => {
  // Load user's decks first to check for already imported decks
  await deckStore.loadDecks()
  await loadCommunityDecks()
})

const filteredDecks = computed(() => {
  if (!showMyDecksOnly.value || !authStore.user) {
    return communityDecks.value
  }
  return communityDecks.value.filter(deck => deck.authorId === authStore.user!.uid)
})

const isMyDeck = (deck: CommunityDeck): boolean => {
  return authStore.user !== null && deck.authorId === authStore.user.uid
}

const isAlreadyImported = (deck: CommunityDeck): boolean => {
  // Check if user has already imported this deck by looking for originalDeckId
  return deckStore.decks.some(
    userDeck => userDeck.isImported && userDeck.originalDeckId === deck.originalDeckId
  )
}

const loadCommunityDecks = async () => {
  try {
    loading.value = true
    communityDecks.value = await getCommunityDecks()
  } catch (error) {
    console.error('Error loading community decks:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load community decks',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const confirmImport = (deck: CommunityDeck) => {
  Dialog.create({
    title: 'Import Deck',
    message: `Import "${deck.name}" by ${deck.authorName}? This will create a copy of this deck with all ${deck.cardCount} cards in your account.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await handleImport(deck)
  })
}

const handleImport = async (deck: CommunityDeck) => {
  if (!authStore.user) {
    Notify.create({
      type: 'negative',
      message: 'You must be logged in to import decks',
      position: 'top',
    })
    return
  }

  try {
    importing.value = deck.id!
    await importCommunityDeck(deck.id!, authStore.user.uid)

    // Reload user's decks
    await deckStore.loadDecks()

    // Update the community deck's import count locally
    const deckIndex = communityDecks.value.findIndex(d => d.id === deck.id)
    if (deckIndex !== -1) {
      communityDecks.value[deckIndex].importCount++
    }

    Notify.create({
      type: 'positive',
      message: `Successfully imported "${deck.name}"!`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error importing deck:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to import deck',
      position: 'top',
    })
  } finally {
    importing.value = null
  }
}

const confirmUnpublish = (deck: CommunityDeck) => {
  Dialog.create({
    title: 'Unpublish Deck',
    message: `Are you sure you want to unpublish "${deck.name}" from the community? This will remove it from the community decks list.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await handleUnpublish(deck)
  })
}

const handleUnpublish = async (deck: CommunityDeck) => {
  if (!authStore.user) {
    Notify.create({
      type: 'negative',
      message: 'You must be logged in to unpublish decks',
      position: 'top',
    })
    return
  }

  try {
    unpublishing.value = deck.id!
    await unpublishDeck(deck.originalDeckId, authStore.user.uid)

    // Remove from local list
    communityDecks.value = communityDecks.value.filter(d => d.id !== deck.id)

    Notify.create({
      type: 'positive',
      message: `Successfully unpublished "${deck.name}"`,
      position: 'top',
    })
  } catch (error) {
    console.error('Error unpublishing deck:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to unpublish deck',
      position: 'top',
    })
  } finally {
    unpublishing.value = null
  }
}
</script>

<style scoped>
.community-decks-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.community-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.community-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
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

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.community-deck-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.community-deck-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
}

.deck-content {
  flex: 1;
}

.deck-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
}

.deck-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.deck-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.deck-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.deck-actions {
  margin-top: 1rem;
}

.import-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.unpublish-btn {
  width: 100%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.imported-btn {
  width: 100%;
  background: rgba(100, 116, 139, 0.3);
  color: #94a3b8;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  border: 1px solid rgba(100, 116, 139, 0.5);
}

@media (max-width: 768px) {
  .community-decks-container {
    padding: 1rem;
  }

  .decks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
