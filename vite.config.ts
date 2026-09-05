import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split per-route chunks so each top-level app ships independently.
        // Keep the existing core split (react/forms/motion/icons) for shared deps.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('zustand')) return 'react'
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('@phosphor-icons')) return 'icons'
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
