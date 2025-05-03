import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Retention from '../components/metric/Retention'
import { LoadingOverlay, SkeletonCard } from '../components/Loading'
import { useState, useEffect, useRef } from 'react'
import SimpleQC from '../components/metric/SimpleQC'
import FeedbackList from '../components/metric/FeedbackList'

function Dashboard() {
  const { user, logout, fetches } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [retentionData, setRetentionData] = useState([])
  const [qualityData, setQualityData] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const feedbackRef = useRef(null)

  useEffect(() => {
    if (user) {
      setIsLoading(false)
      fetches?.getUserRetention().then(data => {
        setRetentionData(data?.retention||[])
      })
      fetches?.getUserQuality().then(data => {
        setQualityData(data||[])
      })
    }
  }, [user])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

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
        <div className="user-info">
          <h4>{user.name}</h4>
          <p>Email: {user.email}</p>
          <p>Должность: {user.position}</p>
          <p>Отдел: {user.department}</p>
        </div>
        
        <Retention data={retentionData} isMobile={isMobile}/>
        <SimpleQC data={qualityData?.grades} onDateSelect={handleDateSelect} isMobile={isMobile}/>
        
        <div className="feedback-section">
          <h2>Обратная связь</h2>
          <FeedbackList 
            feedback={qualityData?.reviews} 
            selectedDate={selectedDate} 
            isMobile={isMobile} 
            ref={feedbackRef}
          />
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </LoadingOverlay>
    </div>
  )
}

export default Dashboard 