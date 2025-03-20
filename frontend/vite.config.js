import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  define: {
    global: {},
    'global.crypto': 'globalThis.crypto', // Use globalThis instead of require
  },
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
