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
          'Raleway',
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
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:7059/api',
      '/countries': 'http://localhost:7059/countries',
      '/capitals': 'http://localhost:7059/capitals',
    },
  },
})
