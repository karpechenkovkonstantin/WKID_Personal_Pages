// Load Telegram Web App script
const script = document.createElement('script');
script.src = 'https://telegram.org/js/telegram-web-app.js?56';
script.async = true;
document.head.appendChild(script);

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
) 