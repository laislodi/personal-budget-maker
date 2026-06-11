import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // In CI (GitHub Pages), VITE_BASE_PATH=/personal-budget-maker is injected by the workflow.
  // Falls back to '/' for local dev so the dev server works unchanged.
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
