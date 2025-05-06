import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext()
const tg = window.Telegram.WebApp


export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.VITE_APP_SCRIPT_URL || import.meta.env.VITE_APP_SCRIPT_URL

  const groupDict = {
    'g1': 'Администраторы',
    'g2': 'Преподаватели',
    'g3': 'ОКК',
    'g4': '',
    'g5': '',
  }

  const fetchConfig = {
        headers: {
          'Content-Type': "text/plain;charset=utf-8",
            },
        withCredentials: false,
        maxRedirects: 5,
        followRedirects: true 
  }
  
  // Инициализация Telegram Web App
  useEffect(() => {
    tg.expand()
    tg.enableClosingConfirmation()
    // Фон устанавливается в ThemeContext
  }, [])

  useEffect(() => {
    
    const verifyToken = async () => {
      try {
        const responseData = {
          action: 'verifyToken',
          token: localStorage.getItem('token')||token
        }
        const response = await axios.post(`${API_URL}`, responseData, fetchConfig)

        return response.data.valid
      } catch (error) {
        console.error('Error verifying token:', error)
        return false
      }
    }

    const checkToken = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            return false;
          } else {
            const isValid = await verifyToken();
            if (isValid) {
              getUserInfo(token);
              setLoading(false);
              return true;
            } else {
              return false;
            }
          }
        } catch (error) {
          console.error('Error decoding token:', error);

          return false;
        }
      } else {
        return false;
      }
    };

    const checkAuthTelegram = async () => {
      try {
        if (!tg?.initDataUnsafe?.user?.id) {
          console.log('No Telegram ID');
          setLoading(false);
          return false;
        }
        
        const responseData = {
          action: 'authTelegram',
          telegramId: tg.initDataUnsafe.user.id
        }
        const response = await axios.post(`${API_URL}`, responseData, fetchConfig)

        if (response.data.token) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          getUserInfo(response.data.token)
          setLoading(false)
          return true
        } else {
          setLoading(false)
          return false
        }
      } catch (error) {
        console.error('Error authenticating Telegram:', error)
        setLoading(false)
        return false
      }
    }

    const authenticate = async () => {
      setLoading(true); // Установка плашки загрузки при старте проверки
      
      // Сначала проверяем существующий токен
      const tokenValid = await checkToken();
      
      // Если токен не валиден или отсутствует, пробуем войти через Telegram
      if (!tokenValid) {
        const telegramValid = await checkAuthTelegram();
        
        // Если ни токен, ни Telegram не прошли, показываем форму логина
        if (!telegramValid) {
          logout();
        }
      }
    };

    authenticate();
  }, []);

  const getUserInfo = async (jwt) => {
    try {
      let decoded = jwtDecode(jwt);
      setUser(decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }


  const login = async (username, password) => {
    setLoading(true)
    const responseData = {
      action: 'authenticate',
      username,
      password
    }

    try {
      const response = await axios.post(`${API_URL}`, responseData, fetchConfig)
      if (response.data.token) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        getUserInfo(response.data.token)
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false) 
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    setLoading(false);
  }

  const fetchData = async (action, payload={}) => {
    const responseData = {
      action,
      token: localStorage.getItem('token')||token,
      ...payload
    }
    try {
      const response = await axios.post(`${API_URL}`, responseData, fetchConfig)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${action}:`, error)
      return null
    }
  }

  const getUserRetention = async (teacherId = null) => {
    return fetchData('getUserRetention', teacherId ? { teacherId } : {})
  }

  const getUserQualityExt = async (teacherId = null) => {
    return fetchData('getUserQualityExt', teacherId ? { teacherId } : {})
  }

  const getTeachersList = async () => {
    return fetchData('getTeachersList')
  }

  const value = {
    token,
    user,
    groupDict,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    tg,
    fetches:{
      getUserRetention,
      getUserQualityExt,
      getTeachersList
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
} 