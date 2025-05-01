import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components/Loading'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, token, loading } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)

  const loadingContent = () => {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <LoadingSpinner />
      </div> 
    )
  }
  const loginContent = (username, password) => {
    return (
      <div>
          <h2>Вход в систему</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Логин:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Войти</button>
          </form>
          {error && <div className="error">{error}</div>}
        </div>
    )
  }

  useEffect(() => {

    if (token && !loading) {
      navigate('/dashboard')
    }
    if (loading) {
      setContent(loadingContent())
    }
    if (!token && !loading) {
      setContent(loginContent(username, password))
    }
  }, [token, loading, navigate, username, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const success = await login(username, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Неверный логин или пароль')
    }
  }

  return content
}

export default Login 