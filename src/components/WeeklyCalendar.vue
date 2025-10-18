<template>
  <div class="weekly-calendar-container">
    <!-- Loading state -->
    <div v-if="deckStore.loading" class="flex flex-center" style="min-height: 400px">
      <q-spinner color="primary" size="48px" />
    </div>

    <!-- Calendar loaded -->
    <div v-else-if="deckStore.currentDeck">
      <!-- Header -->
      <div class="calendar-header">
        <div class="header-left">
          <q-btn
            flat
            dense
            icon="arrow_back"
            color="white"
            @click="$emit('back')"
            size="md"
          >
            <q-tooltip>Back to deck</q-tooltip>
          </q-btn>
          <div class="calendar-info">
            <h2 class="calendar-title">Weekly Calendar - {{ deckStore.currentDeck.name }}</h2>
            <p class="calendar-subtitle">
              {{ weekRange }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn
            flat
            dense
            icon="chevron_left"
            color="white"
            @click="previousWeek"
            size="md"
          >
            <q-tooltip>Previous week</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="today"
            color="white"
            @click="goToCurrentWeek"
            size="md"
          >
            <q-tooltip>Current week</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="chevron_right"
            color="white"
            @click="nextWeek"
            size="md"
          >
            <q-tooltip>Next week</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Week stats -->
      <div class="week-stats">
        <div class="stat-card">
          <q-icon name="event" size="24px" color="purple-4" />
          <div class="stat-info">
            <div class="stat-value">{{ totalDueThisWeek }}</div>
            <div class="stat-label">Total Due This Week</div>
          </div>
        </div>
        <div class="stat-card">
          <q-icon name="today" size="24px" color="orange-4" />
          <div class="stat-info">
            <div class="stat-value">{{ dueTodayCount }}</div>
            <div class="stat-label">Due Today</div>
          </div>
        </div>
      </div>

      <!-- Calendar grid with navigation arrows -->
      <div class="calendar-grid-wrapper">
        <q-btn
          round
          flat
          icon="chevron_left"
          color="white"
          size="lg"
          class="week-nav-arrow week-nav-left"
          @click="previousWeek"
        >
          <q-tooltip>Previous week</q-tooltip>
        </q-btn>

        <q-btn
          round
          flat
          icon="chevron_right"
          color="white"
          size="lg"
          class="week-nav-arrow week-nav-right"
          @click="nextWeek"
        >
          <q-tooltip>Next week</q-tooltip>
        </q-btn>

        <div class="calendar-grid">
          <div
            v-for="day in weekDays"
            :key="day.date.toISOString()"
            class="day-card"
            :class="{ 'is-today': isToday(day.date), 'is-past': isPast(day.date) }"
          >
          <div class="day-header">
            <div class="day-name">{{ day.dayName }}</div>
            <div class="day-date">{{ day.dateStr }}</div>
          </div>

          <div class="day-count">
            <q-badge
              :color="day.cards.length > 0 ? 'orange' : 'grey-7'"
              :label="day.cards.length === 0 ? 'None' : `${day.cards.length} card${day.cards.length > 1 ? 's' : ''}`"
            />
          </div>

          <!-- Cards for this day -->
          <div v-if="day.cards.length > 0" class="day-cards">
            <div
              v-for="card in day.cards"
              :key="card.id"
              class="calendar-card-item"
              @click="$emit('startStudy', card)"
            >
              <q-tooltip
                :offset="[0, 8]"
                max-width="300px"
                anchor="top middle"
                self="bottom middle"
              >
                <div class="card-tooltip">
                  <div class="tooltip-label">Question:</div>
                  <div class="tooltip-content">{{ card.title }}</div>
                </div>
              </q-tooltip>
              <div class="card-title">{{ card.title }}</div>
              <div class="card-time">{{ formatCardTime(card) }}</div>
              <q-icon name="play_arrow" size="16px" color="grey-5" class="play-icon" />
            </div>
          </div>

          <div v-else class="no-cards">
            <q-icon name="check_circle" size="24px" color="grey-7" />
            <div class="no-cards-text">No cards due</div>
          </div>
        </div>
        </div>
      </div>

      <!-- Empty state if no cards in deck -->
      <div v-if="deckStore.currentDeckCards.length === 0" class="empty-state">
        <q-icon name="event_busy" size="80px" color="grey-5" />
        <h3 class="empty-title">No cards in deck</h3>
        <p class="empty-description">Add cards to your deck to see them in the calendar.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDeckStore } from '../stores/deck'
import { Card } from '../types/deck'

const props = defineProps<{
  deckId: string
}>()

const emit = defineEmits<{
  back: []
  startStudy: [card: Card]
}>()

const deckStore = useDeckStore()
const currentWeekStart = ref<Date>(getStartOfDay(new Date()))

interface DayInfo {
  date: Date
  dayName: string
  dateStr: string
  cards: Card[]
}

onMounted(async () => {
  await deckStore.loadDeck(props.deckId)
})

// Helper to get start of week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Helper to get start of day
function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to get end of day
function getEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// Get week range string
const weekRange = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
})

// Get cards due in the next 7 days starting from currentWeekStart
const weekDays = computed((): DayInfo[] => {
  const days: DayInfo[] = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)

    const startOfDay = getStartOfDay(date)
    const endOfDay = getEndOfDay(date)

    // Find cards due on this day
    const cardsForDay = deckStore.currentDeckCards.filter((card) => {
      const dueDate = new Date(card.fsrsData.due)
      return dueDate >= startOfDay && dueDate <= endOfDay
    })

    days.push({
      date,
      dayName: dayNames[date.getDay()],
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cards: cardsForDay,
    })
  }

  return days
})

// Total due this week
const totalDueThisWeek = computed(() => {
  return weekDays.value.reduce((sum, day) => sum + day.cards.length, 0)
})

// Due today count
const dueTodayCount = computed(() => {
  const today = getStartOfDay(new Date())
  const todayDay = weekDays.value.find((day) =>
    getStartOfDay(day.date).getTime() === today.getTime()
  )
  return todayDay ? todayDay.cards.length : 0
})

// Check if date is today
function isToday(date: Date): boolean {
  const today = getStartOfDay(new Date())
  return getStartOfDay(date).getTime() === today.getTime()
}

// Check if date is in the past
function isPast(date: Date): boolean {
  const today = getStartOfDay(new Date())
  return getStartOfDay(date).getTime() < today.getTime()
}

// Format card time
function formatCardTime(card: Card): string {
  const dueDate = new Date(card.fsrsData.due)
  return dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// Navigation functions
function previousWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
}

function nextWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
}

function goToCurrentWeek() {
  currentWeekStart.value = getStartOfDay(new Date())
}
</script>

<style scoped>
.weekly-calendar-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem;
  padding-left: calc(2rem + 50px);
  padding-right: calc(2rem + 50px);
}

.calendar-header {
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

.calendar-info {
  flex: 1;
}

.calendar-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.calendar-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-grid-wrapper {
  position: relative;
}

.week-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.week-nav-arrow:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.week-nav-left {
  left: calc(-1.5rem - 50px);
}

.week-nav-right {
  right: calc(-1.5rem - 50px);
}

.week-stats {
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

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.day-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.day-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
}

.day-card.is-today {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(102, 126, 234, 0.1);
}

.day-card.is-past {
  opacity: 0.7;
}

.day-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-date {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.day-count {
  margin-bottom: 1rem;
}

.day-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.calendar-card-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.calendar-card-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.calendar-card-item:hover .play-icon {
  opacity: 1;
}

.card-title {
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding-right: 1.5rem;
}

.play-icon {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.no-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  opacity: 0.5;
}

.no-cards-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-top: 2rem;
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

.card-tooltip {
  padding: 0.5rem;
}

.tooltip-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.tooltip-content {
  font-size: 0.875rem;
  color: white;
  line-height: 1.5;
  word-wrap: break-word;
}

@media (max-width: 1200px) {
  .calendar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .weekly-calendar-container {
    padding: 1rem;
  }

  .calendar-header {
    flex-direction: column;
  }

  .header-left {
    width: 100%;
  }

  .calendar-title {
    font-size: 1.5rem;
  }

  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .day-card {
    min-height: 200px;
  }

  .week-nav-arrow {
    display: none;
  }
}
</style>
