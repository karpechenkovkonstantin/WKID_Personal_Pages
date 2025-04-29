import { defineConfig } from 'vite'
import devConfig from './vite.config.dev'
import prodConfig from './vite.config.prod'

export default defineConfig(({ command, mode }) => {
  if (command === 'serve' && mode === 'development') {
    return devConfig
  } else {
    return prodConfig
  }
})