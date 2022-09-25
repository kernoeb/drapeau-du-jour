import {fileURLToPath, URL} from 'url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteFonts from 'vite-plugin-fonts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), ViteFonts({
    google: {
      families: [{
        name: 'Fugaz One', styles: 'ital,wght@0,400;1,200', defer: true
      }]
    }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'crypto': 'crypto-browserify'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  }
})

