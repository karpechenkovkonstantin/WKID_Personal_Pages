import { defineConfig } from 'vite'
import devConfig from './vite.config.dev'
import prodConfig from './vite.config.prod'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return devConfig
  } else {
    return prodConfig
  }
})