/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'browser-passworder' {
  export function encrypt(password: string, data: unknown): Promise<string>
  export function decrypt<T = unknown>(password: string, data: string): Promise<T>
}

declare module '@tsparticles/vue3' {
  import type { Plugin } from 'vue'
  const Particles: Plugin
  export default Particles
}
