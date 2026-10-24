import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import Unfonts from 'unplugin-fonts/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    Unfonts({
      google: {
        families: [
          { name: 'Fugaz One', styles: 'ital,wght@0,400;1,200', defer: true },
          { name: 'Raleway', styles: 'wght@400;500;600;700' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'crypto': 'crypto-browserify',
    },
  },
  // browser-passworder reads `global.crypto`, which browsers do not define.
  // `define` covers the build, the optimizer option covers dev.
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        define: {
          global: 'globalThis',
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:7059',
      '/countries': 'http://localhost:7059',
      '/capitals': 'http://localhost:7059',
    },
  },
})
