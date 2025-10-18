import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { h } from 'vue'

// Empty component for routing - we handle views in MainPage
const EmptyComponent = { render: () => h('div') }

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: EmptyComponent
  },
  {
    path: '/deck/:deckId',
    name: 'deck',
    component: EmptyComponent
  },
  {
    path: '/deck/:deckId/study',
    name: 'study',
    component: EmptyComponent
  },
  {
    path: '/deck/:deckId/calendar',
    name: 'calendar',
    component: EmptyComponent
  },
  {
    path: '/community',
    name: 'community',
    component: EmptyComponent
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
