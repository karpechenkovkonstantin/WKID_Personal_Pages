import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './components/css/index.css'
import { applyTelegramTheme } from './theme'

// Применяем тему Telegram, если доступна - это только начальная стилизация
// ThemeContext возьмет на себя управление после монтирования React
applyTelegramTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
) 