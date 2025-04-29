import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const isDev = process.env.NODE_ENV_MODE !== 'production'

export default defineConfig({
  plugins: [react()],
  server: isDev ? {
    port: 443,
    host: "0.0.0.0",
    hmr: {
      host: 'tg-mini-app.local',
      port: 443,
    },
    https: {
      key: fs.readFileSync('./.cert/localhost-key.pem'),
      cert: fs.readFileSync('./.cert/localhost.pem'),
    },
  } : undefined,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: isDev ? false : 'terser',
    terserOptions: isDev ? undefined : {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
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