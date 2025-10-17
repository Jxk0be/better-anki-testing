import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FSRS, Card, Grade, ReviewLog, createEmptyCard } from 'ts-fsrs'

export interface CardData {
  id: string
  front: string
  back: string
  card: Card
  reviewLogs: ReviewLog[]
}

export const useFSRSStore = defineStore('fsrs', () => {
  // Initialize FSRS with default parameters
  const fsrs = new FSRS({})
  const cards = ref<CardData[]>([])

  function createCard(id: string, front: string, back: string): CardData {
    const newCard: CardData = {
      id,
      front,
      back,
      card: createEmptyCard(),
      reviewLogs: []
    }
    cards.value.push(newCard)
    return newCard
  }

  function reviewCard(cardId: string, grade: Grade): CardData | undefined {
    const cardData = cards.value.find(c => c.id === cardId)
    if (!cardData) return undefined

    const now = new Date()
    const schedulingCards = fsrs.repeat(cardData.card, now)

    // Get the appropriate rating based on grade
    const rating = schedulingCards[grade]

    // Update card with new scheduling info
    cardData.card = rating.card
    cardData.reviewLogs.push(rating.log)

    return cardData
  }

  function getCardsDue(): CardData[] {
    const now = new Date()
    return cards.value.filter(cardData => {
      return cardData.card.due <= now
    })
  }

  function deleteCard(cardId: string): boolean {
    const index = cards.value.findIndex(c => c.id === cardId)
    if (index !== -1) {
      cards.value.splice(index, 1)
      return true
    }
    return false
  }

  function getCard(cardId: string): CardData | undefined {
    return cards.value.find(c => c.id === cardId)
  }

  return {
    cards,
    createCard,
    reviewCard,
    getCardsDue,
    deleteCard,
    getCard,
    fsrs
  }
})
