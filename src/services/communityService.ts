import {
  addDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from './firestore'
import { CommunityDeck, Deck, Card } from '../types/deck'
import { getCards, createCard } from './deckService'

const COMMUNITY_DECKS_COLLECTION = 'communityDecks'

/**
 * Publish a deck to the community
 */
export const publishDeckToCommunity = async (
  deck: Deck,
  authorName: string
): Promise<string> => {
  // Check if already published
  const existing = await getDocuments<CommunityDeck>(
    COMMUNITY_DECKS_COLLECTION,
    where('originalDeckId', '==', deck.id),
    where('authorId', '==', deck.userId)
  )

  if (existing.length > 0) {
    // Update existing community deck
    const communityDeckId = existing[0].id!
    await updateDocument(COMMUNITY_DECKS_COLLECTION, communityDeckId, {
      name: deck.name,
      description: deck.description,
      cardCount: deck.cardCount,
    })
    return communityDeckId
  }

  // Create new community deck
  const communityDeck: Omit<CommunityDeck, 'id'> = {
    originalDeckId: deck.id!,
    authorId: deck.userId,
    authorName,
    name: deck.name,
    description: deck.description,
    cardCount: deck.cardCount,
    publishedAt: Date.now(),
    importCount: 0,
  }

  return await addDocument(COMMUNITY_DECKS_COLLECTION, communityDeck)
}

/**
 * Get all community decks
 */
export const getCommunityDecks = async (): Promise<CommunityDeck[]> => {
  return await getDocuments<CommunityDeck>(
    COMMUNITY_DECKS_COLLECTION,
    orderBy('publishedAt', 'desc')
  )
}

/**
 * Get a single community deck
 */
export const getCommunityDeck = async (deckId: string): Promise<CommunityDeck | null> => {
  return await getDocument<CommunityDeck>(COMMUNITY_DECKS_COLLECTION, deckId)
}

/**
 * Import a community deck to a user's account
 */
export const importCommunityDeck = async (
  communityDeckId: string,
  userId: string
): Promise<string> => {
  const communityDeck = await getCommunityDeck(communityDeckId)
  if (!communityDeck) {
    throw new Error('Community deck not found')
  }

  // Get original deck's cards
  const originalCards = await getCards(communityDeck.originalDeckId)

  // Create new deck for user
  const now = Date.now()
  const newDeck: Omit<Deck, 'id'> = {
    userId,
    name: communityDeck.name,
    description: communityDeck.description,
    createdAt: now,
    updatedAt: now,
    cardCount: 0,
    isImported: true,
    originalDeckId: communityDeck.originalDeckId,
    originalAuthor: communityDeck.authorId,
    originalAuthorName: communityDeck.authorName,
  }

  const { default: deckService } = await import('./deckService')
  const newDeckId = await addDocument('decks', newDeck)

  // Copy all cards to new deck
  for (const card of originalCards) {
    await createCard(userId, {
      deckId: newDeckId,
      title: card.title,
      description: card.description,
    })
  }

  // Increment import count
  await updateDocument(COMMUNITY_DECKS_COLLECTION, communityDeckId, {
    importCount: communityDeck.importCount + 1,
  })

  return newDeckId
}

/**
 * Unpublish a deck from community
 */
export const unpublishDeck = async (deckId: string, userId: string): Promise<void> => {
  const communityDecks = await getDocuments<CommunityDeck>(
    COMMUNITY_DECKS_COLLECTION,
    where('originalDeckId', '==', deckId),
    where('authorId', '==', userId)
  )

  for (const deck of communityDecks) {
    await deleteDocument(COMMUNITY_DECKS_COLLECTION, deck.id!)
  }
}

/**
 * Check if a deck is published
 */
export const isDeckPublished = async (deckId: string, userId: string): Promise<boolean> => {
  const communityDecks = await getDocuments<CommunityDeck>(
    COMMUNITY_DECKS_COLLECTION,
    where('originalDeckId', '==', deckId),
    where('authorId', '==', userId)
  )

  return communityDecks.length > 0
}
