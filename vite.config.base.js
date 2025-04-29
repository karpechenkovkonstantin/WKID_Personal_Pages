import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    'process.env.VITE_APP_SCRIPT_URL': JSON.stringify(process.env.VITE_APP_SCRIPT_URL)
  },
  base: './',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}) 