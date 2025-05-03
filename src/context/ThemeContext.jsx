import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [themeColors, setThemeColors] = useState({});
  
  // Функция для получения цветов на основе текущей темы
  const getThemeColors = useCallback((isDark) => {
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
      backgroundColor: isDark ? '#212121' : '#ffffff',
      // Добавьте другие цвета для темы при необходимости
    };
  }, []);
  
  // Функция для применения стилей темы к документу
  const applyThemeStyles = useCallback((isDark, colors) => {
    // Применяем цвет фона к body
    document.body.style.backgroundColor = colors.backgroundColor;
    
    // Обновляем CSS переменные для темы
    document.documentElement.style.setProperty('--background-color', colors.backgroundColor);
    document.documentElement.style.setProperty('--text-color', colors.textColor);
    
    // Если есть темная тема Telegram, используем её цвета
    if (window.Telegram?.WebApp?.themeParams) {
      const { 
        bg_color, 
        text_color, 
        hint_color, 
        button_color,
        button_text_color,
        secondary_bg_color 
      } = window.Telegram.WebApp.themeParams;
      
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
    
    // Добавляем/удаляем класс темной темы
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, []);
  
  // Функция для определения темной темы
  const detectTheme = useCallback(() => {
    let isDark = false;
    let customBackgroundColor = null;
    
    // Метод 1: Проверяем параметры Telegram WebApp, если доступны
    if (window.Telegram?.WebApp) {
      const { backgroundColor, themeParams } = window.Telegram.WebApp;
      
      // Сохраняем цвет фона Telegram для последующего использования
      if (backgroundColor) {
        customBackgroundColor = backgroundColor;
      }
      
      // Проверяем цвет текста для определения темной темы
      if (themeParams?.text_color) {
        isDark = themeParams.text_color.toLowerCase() !== '#000000' && 
                themeParams.text_color.toLowerCase() !== 'rgb(0, 0, 0)';
      }
    } 
    
    if (!isDark) {
      // Метод 2: Проверяем CSS переменные
      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
      isDark = textColor && 
              textColor.toLowerCase() !== '#000000' && 
              textColor.toLowerCase() !== 'rgb(0, 0, 0)';
      
      // Метод 3: Проверяем предпочтения цветовой схемы, если другие методы не сработали
      if (!isDark) {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    
    // Получаем цвета темы на основе определенной темы
    const colors = getThemeColors(isDark);
    
    // Если у нас есть пользовательский фон из Telegram, используем его
    if (customBackgroundColor) {
      colors.backgroundColor = customBackgroundColor;
    }
    
    // Применяем тему
    applyThemeStyles(isDark, colors);
    
    // Обновляем состояние
    setIsDarkTheme(isDark);
    setThemeColors(colors);
  }, [getThemeColors, applyThemeStyles]);
  
  // Функция для обновления темы (может быть вызвана из компонентов при необходимости)
  const refreshTheme = useCallback(() => {
    detectTheme();
  }, [detectTheme]);
  
  // Мемоизируем значения темы, чтобы избежать ненужных повторных рендеров
  const themeValue = useMemo(() => ({
    isDarkTheme,
    themeColors,
    refreshTheme
  }), [isDarkTheme, themeColors, refreshTheme]);
  
  useEffect(() => {
    // Начальное определение темы
    detectTheme();
    
    // Слушаем изменения темы (если поддерживается браузером)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleMediaChange);
    
    // Настраиваем интервал для проверки изменений темы (полезно для Telegram)
    const intervalId = setInterval(detectTheme, 2000);
    
    // Слушаем изменения темы Telegram, если доступно
    const tgWebApp = window.Telegram?.WebApp;
    if (tgWebApp) {
      // Некоторые клиенты Telegram поддерживают события изменения темы
      if (typeof tgWebApp.onEvent === 'function') {
        tgWebApp.onEvent('themeChanged', detectTheme);
      }
      
      // Для изменений цвета кнопки Main Button (может указывать на изменение темы)
      if (typeof tgWebApp.MainButton?.onClick === 'function') {
        const originalOnClick = tgWebApp.MainButton.onClick;
        tgWebApp.MainButton.onClick = (callback) => {
          detectTheme();
          return originalOnClick(callback);
        };
      }
    }
    
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      clearInterval(intervalId);
      
      if (tgWebApp && typeof tgWebApp.offEvent === 'function') {
        tgWebApp.offEvent('themeChanged', detectTheme);
      }
    };
  }, [detectTheme]);

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
} 