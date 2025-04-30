export function applyTelegramTheme() {
  // Check if we're in Telegram Web App
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    
    // Enable the Telegram theme
    document.documentElement.classList.add('telegram-theme');
    
    // Expand the app to full height
    webApp.expand();
    
    // Set the background color to match Telegram's theme
    document.body.style.backgroundColor = webApp.backgroundColor;
    
    // Set the header color if needed
    webApp.setHeaderColor(webApp.headerColor);
    
    // Set the background color of the main container
    document.body.style.backgroundColor = webApp.backgroundColor;
  }
} 