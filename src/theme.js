// Вспомогательные функции для работы с темой в Telegram WebApp и общей обработки темы

// Применение темы Telegram при инициализации приложения
export function applyTelegramTheme() {
  // Проверяем, находимся ли мы в Telegram Web App
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    
    // Включаем CSS класс темы Telegram
    document.documentElement.classList.add('telegram-theme');
    
    // Разворачиваем приложение на полную высоту
    webApp.expand();
    
    // Начальное применение цвета фона (в дальнейшем будет управляться ThemeContext)
    if (webApp.backgroundColor) {
      document.body.style.backgroundColor = webApp.backgroundColor;
      // Также устанавливаем CSS переменную для компонентов, которые от нее зависят
      document.documentElement.style.setProperty('--background-color', webApp.backgroundColor);
    }
    
    // Устанавливаем цвет заголовка при необходимости
    if (typeof webApp.setHeaderColor === 'function') {
      webApp.setHeaderColor(webApp.headerColor || 'var(--background-color)');
    }
    
    // Если доступны параметры темы, применяем их к CSS переменным
    if (webApp.themeParams) {
      const { 
        bg_color, 
        text_color, 
        hint_color, 
        button_color,
        button_text_color,
        secondary_bg_color 
      } = webApp.themeParams;
      
      if (bg_color) document.documentElement.style.setProperty('--background-color', bg_color);
      if (text_color) document.documentElement.style.setProperty('--text-color', text_color);
      if (hint_color) document.documentElement.style.setProperty('--border-color', hint_color);
      if (button_color) document.documentElement.style.setProperty('--primary-color', button_color);
      if (button_text_color) document.documentElement.style.setProperty('--button-text-color', button_text_color);
      if (secondary_bg_color) {
        document.documentElement.style.setProperty('--input-background', secondary_bg_color);
        document.documentElement.style.setProperty('--user-info-background', secondary_bg_color);
      }
    }
    
    // Слушаем изменения темы
    if (typeof webApp.onEvent === 'function') {
      webApp.onEvent('themeChanged', () => {
        // Это будет обрабатываться ThemeContext, но мы можем обновить немедленно для более плавных переходов
        if (webApp.backgroundColor) {
          document.body.style.backgroundColor = webApp.backgroundColor;
          document.documentElement.style.setProperty('--background-color', webApp.backgroundColor);
        }
        
        // Обновляем CSS переменные при изменении темы
        if (webApp.themeParams) {
          const { 
            bg_color, 
            text_color, 
            hint_color, 
            button_color,
            button_text_color,
            secondary_bg_color 
          } = webApp.themeParams;
          
          if (bg_color) document.documentElement.style.setProperty('--background-color', bg_color);
          if (text_color) document.documentElement.style.setProperty('--text-color', text_color);
          if (hint_color) document.documentElement.style.setProperty('--border-color', hint_color);
          if (button_color) document.documentElement.style.setProperty('--primary-color', button_color);
          if (secondary_bg_color) {
            document.documentElement.style.setProperty('--input-background', secondary_bg_color);
            document.documentElement.style.setProperty('--user-info-background', secondary_bg_color);
          }
        }
      });
    }
  }
}

// Проверка, работает ли приложение в темном режиме
export function isDarkMode() {
  // Метод 1: Проверяем параметры Telegram WebApp, если доступны
  if (window.Telegram?.WebApp?.themeParams) {
    const { text_color } = window.Telegram.WebApp.themeParams;
    // Если цвет текста не черный, вероятно, это темная тема
    if (text_color) {
      return text_color.toLowerCase() !== '#000000' && 
             text_color.toLowerCase() !== 'rgb(0, 0, 0)';
    }
  }
  
  // Метод 2: Проверяем CSS переменные
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  if (textColor) {
    return textColor.toLowerCase() !== '#000000' && 
           textColor.toLowerCase() !== 'rgb(0, 0, 0)';
  }
  
  // Метод 3: Проверяем предпочтения цветовой схемы
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Получение значения CSS переменной с резервным значением
export function getCssVariable(varName, fallback = '') {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName).trim() || fallback;
}

// Получение стандартных цветов для текущей темы
export function getThemeColors(forceTheme = null) {
  // Использовать указанную тему или определить автоматически
  const isDark = forceTheme !== null ? forceTheme === 'dark' : isDarkMode();
  
  // Получаем цвет фона из Telegram или используем стандартный
  let backgroundColor = isDark ? '#212121' : '#ffffff';
  if (window.Telegram?.WebApp?.backgroundColor) {
    backgroundColor = window.Telegram.WebApp.backgroundColor;
  }
  
  return {
    // Основные цвета для графиков
    emptyColor: isDark ? '#708499' : '#ffffff',
    dayBorderColor: isDark ? '#2e2e2e' : '#e2e2e2',
    textColor: isDark ? '#ffffff' : '#000000',
    chartColors: isDark 
        ? ['#d3312b', '#fba760', '#c3e57e', '#06733d'] 
        : ['#d3312b', '#fba760', '#c3e57e', '#06733d'],
    blendMode: isDark ? "screen" : "multiply",
    colorScheme: isDark ? 'blues' : 'tableau10',
    backgroundColor: backgroundColor,
    // Добавьте другие цвета для темы при необходимости
  };
} 