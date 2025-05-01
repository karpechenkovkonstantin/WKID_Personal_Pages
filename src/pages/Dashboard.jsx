import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Retention from '../metric/Retention'
import { LoadingOverlay, SkeletonCard } from '../components/Loading'
import { useState, useEffect } from 'react'

function Dashboard() {
  const { user, logout, fetches } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [retentionData, setRetentionData] = useState([])

  useEffect(() => {
    if (user) {
      console.log(user)
      setIsLoading(false)
      fetches?.getUserRetention().then(data => {
        setRetentionData(data?.retention||[])
      })
    }
  }, [user])


  const handleLogout = () => {
    logout()
    navigate('/')
  }
  if (!user) {
    return (
      <div className="fade-in">
        <SkeletonCard />
        {/* <SkeletonCard /> */}
      </div>
    )
  }

  return (
    <div className="fade-in">
      <LoadingOverlay isLoading={isLoading}>
        <h2>Информация о пользователе</h2>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>Email: {user.email}</p>
          <p>Должность: {user.position}</p>
          <p>Отдел: {user.department}</p>
        </div>
      
        <Retention data={retentionData}/>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </LoadingOverlay>
    </div>
  )
}

export default Dashboard 