import { createApp } from 'vue'
import App from './App.vue'
import Particles from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'
import './index.css'

createApp(App)
  .use(Particles, {
    init: async engine => {
      await loadFull(engine) // or you can load the slim version from "@tsparticles/slim" if don't need Shapes or Animations
    }
  })
  .mount('#app')
