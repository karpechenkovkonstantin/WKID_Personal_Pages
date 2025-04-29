import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  define: {
    'process.env.VITE_APP_SCRIPT_URL': JSON.stringify(process.env.VITE_APP_SCRIPT_URL)
  }
}) 