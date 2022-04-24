import { createApp } from 'vue'
import App from './App.vue'
import Particles from 'particles.vue3'

import './index.css'

createApp(App)
  .use(Particles)
  .mount('#app')

