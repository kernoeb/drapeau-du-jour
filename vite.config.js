import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unfonts from 'unplugin-fonts/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unfonts({
      google: {
        families: [
          { name: 'Fugaz One', styles: 'ital,wght@0,400;1,200', defer: true },
          'Raleway'
        ]
      }
    })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      crypto: 'crypto-browserify'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:7059/api',
      '/countries': 'http://localhost:7059/countries',
      '/capitals': 'http://localhost:7059/capitals'
    }
  }
})
