import {
  addDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from './firestore'
import { Deck, Card, CreateDeckInput, CreateCardInput } from '../types/deck'
import { createEmptyCard } from './fsrsService'

const DECKS_COLLECTION = 'decks'
const CARDS_COLLECTION = 'cards'

// Deck operations
export const createDeck = async (userId: string, input: CreateDeckInput): Promise<string> => {
  const now = Date.now()
  const deck: Omit<Deck, 'id'> = {
    userId,
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    cardCount: 0,
  }
  return await addDocument(DECKS_COLLECTION, deck)
}

export const getUserDecks = async (userId: string): Promise<Deck[]> => {
  return await getDocuments<Deck>(DECKS_COLLECTION, where('userId', '==', userId), orderBy('updatedAt', 'desc'))
}

export const getDeck = async (deckId: string): Promise<Deck | null> => {
  return await getDocument<Deck>(DECKS_COLLECTION, deckId)
}

export const updateDeck = async (deckId: string, updates: Partial<Deck>): Promise<void> => {
  await updateDocument(DECKS_COLLECTION, deckId, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export const deleteDeck = async (deckId: string): Promise<void> => {
  // First delete all cards in the deck
  const cards = await getCards(deckId)
  await Promise.all(cards.map((card) => deleteDocument(CARDS_COLLECTION, card.id!)))

  // Then delete the deck
  await deleteDocument(DECKS_COLLECTION, deckId)
}

// Card operations
export const createCard = async (userId: string, input: CreateCardInput): Promise<string> => {
  if (!input.deckId) {
    throw new Error('Deck ID is required')
  }

  const now = Date.now()
  const fsrsCard = createEmptyCard()

  // Convert FSRS card to a serializable format for Firestore
  const serializableFsrsData = {
    due: fsrsCard.due.toISOString(),
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    elapsed_days: fsrsCard.elapsed_days,
    scheduled_days: fsrsCard.scheduled_days,
    learning_steps: fsrsCard.learning_steps,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    state: fsrsCard.state,
    last_review: fsrsCard.last_review ? fsrsCard.last_review.toISOString() : null,
  }

  const card = {
    deckId: input.deckId,
    userId,
    title: input.title,
    description: input.description,
    fsrsData: serializableFsrsData,
    createdAt: now,
    updatedAt: now,
  }

  const cardId = await addDocument(CARDS_COLLECTION, card)

  // Update deck card count
  const deck = await getDeck(input.deckId)
  if (deck) {
    await updateDeck(input.deckId, {
      cardCount: deck.cardCount + 1,
    })
  }

  return cardId
}

export const getCards = async (deckId: string): Promise<Card[]> => {
  const cards = await getDocuments<Card>(CARDS_COLLECTION, where('deckId', '==', deckId), orderBy('createdAt', 'desc'))

  // Convert date strings back to Date objects for FSRS
  return cards.map(card => ({
    ...card,
    fsrsData: {
      ...card.fsrsData,
      due: new Date(card.fsrsData.due),
      last_review: card.fsrsData.last_review ? new Date(card.fsrsData.last_review) : undefined,
    }
  }))
}

export const getCard = async (cardId: string): Promise<Card | null> => {
  const card = await getDocument<Card>(CARDS_COLLECTION, cardId)
  if (!card) return null

  // Convert date strings back to Date objects for FSRS
  return {
    ...card,
    fsrsData: {
      ...card.fsrsData,
      due: new Date(card.fsrsData.due),
      last_review: card.fsrsData.last_review ? new Date(card.fsrsData.last_review) : undefined,
    }
  }
}

export const updateCard = async (cardId: string, updates: Partial<Card>): Promise<void> => {
  await updateDocument(CARDS_COLLECTION, cardId, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export const deleteCard = async (cardId: string): Promise<void> => {
  const card = await getCard(cardId)
  if (card) {
    // Update deck card count
    const deck = await getDeck(card.deckId)
    if (deck) {
      await updateDeck(card.deckId, {
        cardCount: Math.max(0, deck.cardCount - 1),
      })
    }
  }

  await deleteDocument(CARDS_COLLECTION, cardId)
}

// Get due cards for a deck
export const getDueCards = async (deckId: string): Promise<Card[]> => {
  const cards = await getCards(deckId)
  const now = new Date()
  return cards.filter((card) => {
    const dueDate = new Date(card.fsrsData.due)
    return dueDate <= now
  })
}

// Get all due cards for a user
export const getAllDueCards = async (userId: string): Promise<Card[]> => {
  const cards = await getDocuments<Card>(CARDS_COLLECTION, where('userId', '==', userId))
  const now = new Date()
  return cards.filter((card) => {
    const dueDate = new Date(card.fsrsData.due)
    return dueDate <= now
  })
}
