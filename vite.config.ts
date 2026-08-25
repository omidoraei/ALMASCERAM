import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch (error) {
    void error
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'zustand'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            motion: ['framer-motion'],
            icons: ['@phosphor-icons/react'],
          },
        },
      },
    },
  };
})
