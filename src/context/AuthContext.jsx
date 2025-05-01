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
    document.body.style.backgroundColor = tg.backgroundColor
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
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          const isValid = await verifyToken();
          if (isValid) {
            getUserInfo(token)
          } else {
            logout();
            return false;
          }
        }
        setLoading(false)
        return true;
      } else {
        setLoading(false);
        return false;
      }
    };

    const checkAuthTelegram = async () => {
      try {
        const responseData = {
          action: 'authTelegram',
          telegramId: tg?.initDataUnsafe?.user?.id
        }
        const response = await axios.post(`${API_URL}`, responseData, fetchConfig)

        if (response.data.token) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          getUserInfo(response.data.token)
          return true
        }
      } catch (error) {
        console.error('Error authenticating Telegram:', error)
        return false
      }
    }

    const telegramAuth = async () => {
      if (tg?.initDataUnsafe?.user?.id) {
        const isValid = await checkAuthTelegram();
        if (!isValid) {
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
        telegramAuth();
      }
    });
  }, []);

  const getUserInfo = async (jwt) => {
    try {
      const decoded = jwtDecode(jwt);
      setUser(decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  const fetchUserInfo = async () => {
    const responseData = {
      action: 'getUserInfo',
      token: localStorage.getItem('token')||token
    }
    try {
      axios.post(`${API_URL}`, responseData, fetchConfig).then((response)=>{
        setUser(response.data)
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
      logout()
    } finally {
      setLoading(false)
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

  const getUserRetention = async () => {
    const responseData = {
      action: 'getUserRetention',
      token: localStorage.getItem('token')||token
    }
    try {
      const response = await axios.post(`${API_URL}`, responseData, fetchConfig)
      return response.data
    } catch (error) {
      console.error('Error fetching user retention:', error)
      return null
    }
  }

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    tg,
    fetches:{
      getUserRetention
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
} 