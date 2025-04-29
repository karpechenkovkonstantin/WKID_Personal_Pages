import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return <div>Загрузка данных...</div>
  }

  return (
    <div>
      <h2>Информация о пользователе</h2>
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>Email: {user.email}</p>
        <p>Должность: {user.position}</p>
        <p>Отдел: {user.department}</p>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}

export default Dashboard 