import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'
import router from './router'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Import TailwindCSS
import './css/app.css'

import App from './App.vue'

// Initialize Firebase
import { initializeFirebase } from './services/firebase'
initializeFirebase()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
  },
})

app.mount('#app')
