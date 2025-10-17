import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Deck, Card, CreateDeckInput, CreateCardInput } from '../types/deck'
import {
  createDeck as createDeckService,
  getUserDecks,
  getDeck,
  updateDeck as updateDeckService,
  deleteDeck as deleteDeckService,
  createCard as createCardService,
  getCards,
  getCard,
  updateCard as updateCardService,
  deleteCard as deleteCardService,
  getDueCards,
  getAllDueCards,
} from '../services/deckService'
import { useAuthStore } from './auth'

export const useDeckStore = defineStore('deck', () => {
  const authStore = useAuthStore()

  const decks = ref<Deck[]>([])
  const currentDeck = ref<Deck | null>(null)
  const currentDeckCards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all decks for the current user
  const loadDecks = async () => {
    if (!authStore.user) {
      error.value = 'No user logged in'
      return
    }

    try {
      loading.value = true
      error.value = null
      decks.value = await getUserDecks(authStore.user.uid)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load decks'
      console.error('Error loading decks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create a new deck
  const createDeck = async (input: CreateDeckInput) => {
    if (!authStore.user) {
      throw new Error('No user logged in')
    }

    try {
      loading.value = true
      error.value = null
      const deckId = await createDeckService(authStore.user.uid, input)
      await loadDecks() // Reload decks
      return deckId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create deck'
      console.error('Error creating deck:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a deck
  const updateDeck = async (deckId: string, updates: Partial<Deck>) => {
    try {
      loading.value = true
      error.value = null
      await updateDeckService(deckId, updates)
      await loadDecks() // Reload decks
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update deck'
      console.error('Error updating deck:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a deck
  const deleteDeck = async (deckId: string) => {
    try {
      loading.value = true
      error.value = null
      await deleteDeckService(deckId)
      await loadDecks() // Reload decks
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete deck'
      console.error('Error deleting deck:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Load a specific deck and its cards
  const loadDeck = async (deckId: string) => {
    try {
      loading.value = true
      error.value = null
      const deck = await getDeck(deckId)
      if (!deck) {
        throw new Error('Deck not found')
      }
      currentDeck.value = deck
      currentDeckCards.value = await getCards(deckId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load deck'
      console.error('Error loading deck:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create a new card
  const createCard = async (input: CreateCardInput) => {
    if (!authStore.user) {
      throw new Error('No user logged in')
    }

    try {
      loading.value = true
      error.value = null
      const cardId = await createCardService(authStore.user.uid, input)
      if (currentDeck.value?.id === input.deckId) {
        await loadDeck(input.deckId) // Reload current deck if it's the same
      }
      await loadDecks() // Reload decks to update card counts
      return cardId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create card'
      console.error('Error creating card:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a card
  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      loading.value = true
      error.value = null
      await updateCardService(cardId, updates)
      if (currentDeck.value) {
        await loadDeck(currentDeck.value.id!) // Reload current deck
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update card'
      console.error('Error updating card:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a card
  const deleteCard = async (cardId: string) => {
    try {
      loading.value = true
      error.value = null
      await deleteCardService(cardId)
      if (currentDeck.value) {
        await loadDeck(currentDeck.value.id!) // Reload current deck
      }
      await loadDecks() // Reload decks to update card counts
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete card'
      console.error('Error deleting card:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get due cards for current deck
  const getDueCardsForDeck = async (deckId: string): Promise<Card[]> => {
    try {
      return await getDueCards(deckId)
    } catch (err) {
      console.error('Error getting due cards:', err)
      return []
    }
  }

  // Get all due cards for user
  const getAllUserDueCards = async (): Promise<Card[]> => {
    if (!authStore.user) {
      return []
    }
    try {
      return await getAllDueCards(authStore.user.uid)
    } catch (err) {
      console.error('Error getting all due cards:', err)
      return []
    }
  }

  return {
    // State
    decks,
    currentDeck,
    currentDeckCards,
    loading,
    error,
    // Actions
    loadDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    loadDeck,
    createCard,
    updateCard,
    deleteCard,
    getDueCardsForDeck,
    getAllUserDueCards,
  }
})
