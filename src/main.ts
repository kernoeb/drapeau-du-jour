import { createApp } from 'vue'
import App from './App.vue'
import Particles from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'
import './index.css'

createApp(App)
  .use(Particles, {
    init: async (engine: unknown) => {
      await loadFull(engine as Parameters<typeof loadFull>[0])
    },
  })
  .mount('#app')
