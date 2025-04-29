import { defineConfig } from 'vite'
import baseConfig from './vite.config.base'
import fs from 'fs'

export default defineConfig({
  ...baseConfig,
  server: {
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
  }
}) 