import { defineConfig } from 'vite'
import baseConfig from './vite.config.base'

export default defineConfig({
  ...baseConfig,
  build: {
    ...baseConfig.build,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}) 