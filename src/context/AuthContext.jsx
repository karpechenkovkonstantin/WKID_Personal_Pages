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

  // Инициализация Telegram Web App
  useEffect(() => {
    tg.expand()
    tg.enableClosingConfirmation()
    document.body.style.backgroundColor = tg.backgroundColor
  }, [])

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'verifyToken',
          token: localStorage.getItem('token')||token
        }
      })
      return response.data.valid
    } catch (error) {
      console.error('Error verifying token:', error)
      return false
    }
  }

  const authTelegram = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'authTelegram',
          telegramId: tg?.initDataUnsafe?.user?.id
        }
      })
      if (response.data.token) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        return true
      }
    } catch (error) {
      console.error('Error authenticating Telegram:', error)
      return false
    }
  }

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          const isValid = await verifyToken();
          if (isValid) {
            await fetchUserInfo();
          } else {
            logout();
          }
        }
        return true;
      } else {
        // setLoading(false);
        return false;
      }
    };

    const checkTelegramAuth = async () => {
      if (tg?.initDataUnsafe?.user?.id) {
        const isValid = await authTelegram();
        if (isValid) {
          await fetchUserInfo();
        } else {
          logout();
        }
      }
      else {
        console.log('No Telegram ID');
        setLoading(false);
      }
    };

    checkToken().then((tokenValid) => {
      if (!tokenValid) {
        checkTelegramAuth();
      }
    });
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'getUserInfo',
          token: localStorage.getItem('token')||token
        }
      })
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user info:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'authenticate', 
          username,
          password
        }
      })

      if (response.data.token) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        await fetchUserInfo()
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

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    tg
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
} 