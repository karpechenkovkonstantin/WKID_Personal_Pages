import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_APP_SCRIPT_URL

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'verifyToken',
          token
        }
      })
      return response.data.valid
    } catch (error) {
      console.error('Error verifying token:', error)
      return false
    }
  }

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          const isValid = await verifyToken()
          if (isValid) {
            await fetchUserInfo()
          } else {
            logout()
          }
        }
      } else {
        setLoading(false)
      }
    }
    checkToken()
  }, [token])

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          action: 'getUserInfo',
          token
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
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
} 