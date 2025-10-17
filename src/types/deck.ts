import type { Card as FSRSCard, Grade, RecordLog } from 'ts-fsrs'
import { Rating, State } from 'ts-fsrs'

// Deck type
export interface Deck {
  id?: string
  userId: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
  cardCount: number
  // For imported decks
  isImported?: boolean
  originalDeckId?: string
  originalAuthor?: string
  originalAuthorName?: string
}

// Community Deck type (published to community)
export interface CommunityDeck {
  id?: string
  originalDeckId: string
  authorId: string
  authorName: string
  name: string
  description?: string
  cardCount: number
  publishedAt: number
  importCount: number
}

// Card type with FSRS data
export interface Card {
  id?: string
  deckId: string
  userId: string

  // Card content
  title: string
  description: string

  // FSRS data
  fsrsData: FSRSCard

  // Metadata
  createdAt: number
  updatedAt: number
  lastReviewedAt?: number
}

// Type for creating a new deck
export interface CreateDeckInput {
  name: string
  description?: string
}

// Type for creating a new card
export interface CreateCardInput {
  deckId: string
  title: string
  description: string
}

// Type for reviewing a card
export interface ReviewCardInput {
  cardId: string
  rating: Rating
}

// Type for card with due date info
export interface CardWithDueInfo extends Card {
  isDue: boolean
  dueIn?: number // milliseconds until due (negative if overdue)
}

export { Rating, State }
export type { RecordLog }
