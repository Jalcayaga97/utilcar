import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { webpAssetsPlugin } from './vite/plugins/webpAssets.js'
import { contactApiPlugin } from './vite/plugins/contactApi.js'
import { heroPreloadPlugin } from './vite/plugins/heroPreload.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), webpAssetsPlugin(), contactApiPlugin(), heroPreloadPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('react-router')) return 'router'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-dom') || id.includes('react/')) return 'react'
          return 'vendor'
        },
      },
    },
  },
})
