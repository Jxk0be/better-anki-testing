import { FSRS, createEmptyCard as fsrsCreateEmptyCard, Rating } from 'ts-fsrs'
import type { Card, RecordLog, Grade } from 'ts-fsrs'
import { Card as AppCard } from '../types/deck'
import { updateCard } from './deckService'

// Initialize FSRS with default parameters
const fsrs = new FSRS()

/**
 * Create a new empty card with FSRS initial state
 */
export const createEmptyCard = (): Card => {
  return fsrsCreateEmptyCard(new Date())
}

/**
 * Review a card and update its FSRS data
 * @param card The card to review
 * @param rating The rating given by the user (Again, Hard, Good, Easy)
 * @returns Updated card with new FSRS data and the record log
 */
export const reviewCard = (card: Card, rating: Rating): { card: Card; log: RecordLog } => {
  const scheduling = fsrs.repeat(card, new Date())
  const selectedScheduling = scheduling[rating]

  return {
    card: selectedScheduling.card,
    log: selectedScheduling.log,
  }
}

/**
 * Review a card and save it to the database
 * @param appCard The application card to review
 * @param rating The rating given by the user
 * @returns Updated card
 */
export const reviewAndSaveCard = async (appCard: AppCard, rating: Rating): Promise<AppCard> => {
  const { card: updatedFSRSCard, log } = reviewCard(appCard.fsrsData, rating)

  // Serialize FSRS data for Firestore (convert dates to strings)
  const serializableFsrsData = {
    due: updatedFSRSCard.due.toISOString(),
    stability: updatedFSRSCard.stability,
    difficulty: updatedFSRSCard.difficulty,
    elapsed_days: updatedFSRSCard.elapsed_days,
    scheduled_days: updatedFSRSCard.scheduled_days,
    learning_steps: updatedFSRSCard.learning_steps,
    reps: updatedFSRSCard.reps,
    lapses: updatedFSRSCard.lapses,
    state: updatedFSRSCard.state,
    last_review: updatedFSRSCard.last_review ? updatedFSRSCard.last_review.toISOString() : null,
  }

  const updatedCard: AppCard = {
    ...appCard,
    fsrsData: updatedFSRSCard,
    lastReviewedAt: Date.now(),
  }

  await updateCard(appCard.id!, {
    fsrsData: serializableFsrsData as any,
    lastReviewedAt: updatedCard.lastReviewedAt,
  })

  return updatedCard
}

/**
 * Get the scheduling info for a card (shows when the card will be due for each rating)
 * @param card The card to get scheduling info for
 * @returns Scheduling information for each rating
 */
export const getSchedulingInfo = (card: Card) => {
  return fsrs.repeat(card, new Date())
}

/**
 * Check if a card is due for review
 * @param card The card to check
 * @returns true if the card is due
 */
export const isCardDue = (card: Card): boolean => {
  const now = new Date()
  const dueDate = new Date(card.due)
  return dueDate <= now
}

/**
 * Get time until card is due (in milliseconds)
 * @param card The card to check
 * @returns milliseconds until due (negative if overdue)
 */
export const getTimeUntilDue = (card: Card): number => {
  const now = new Date()
  const dueDate = new Date(card.due)
  return dueDate.getTime() - now.getTime()
}

/**
 * Format the due time in a human-readable way
 * @param card The card to format due time for
 * @returns Human-readable string
 */
export const formatDueTime = (card: Card): string => {
  const timeUntilDue = getTimeUntilDue(card)

  if (timeUntilDue < 0) {
    // Overdue
    const overdueDays = Math.floor(Math.abs(timeUntilDue) / (1000 * 60 * 60 * 24))
    if (overdueDays > 0) {
      return `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`
    }
    return 'Due now'
  }

  // Not due yet
  const days = Math.floor(timeUntilDue / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeUntilDue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeUntilDue % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `Due in ${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `Due in ${hours} hour${hours > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  return 'Due soon'
}

export { Rating }
