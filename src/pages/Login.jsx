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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const success = await login(username, password)
      if (!success) {
        setError('Неверный логин или пароль')
      }
    } catch (err) {
      setError('Ошибка при входе. Попробуйте позже.')
    }
  }
  useEffect(() => {
    if (token && !loading) {
      navigate('/dashboard')
    }
  }, [token, loading, navigate])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '15px' }}>Проверка авторизации...</p>
      </div> 
    )
  }

  // Показывается только если не авторизован и не в процессе проверки
  if (!token && !loading) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '500px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
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

  return null
}

export default Login 