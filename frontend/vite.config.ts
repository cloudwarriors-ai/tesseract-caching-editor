import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['dev-caching-editor.pscx.ai']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dev-caching-editor.pscx.ai']
  }
})
