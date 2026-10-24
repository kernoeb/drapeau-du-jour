/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@tsparticles/vue3' {
  import type { Plugin } from 'vue'
  const Particles: Plugin
  export default Particles
}
