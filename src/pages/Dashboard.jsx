import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Retention from '../components/metric/Retention'
import { LoadingOverlay, SkeletonCard } from '../components/Loading'
import { useState, useEffect, useRef } from 'react'
import SimpleQC from '../components/metric/SimpleQC'
import FeedbackList from '../components/metric/FeedbackList'
import TeacherSelector from '../components/TeacherSelector'

function Dashboard() {
  const { user, logout, fetches, groupDict } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [retentionData, setRetentionData] = useState([])
  const [qualityData, setQualityData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const feedbackRef = useRef(null)
  const [teachersList, setTeachersList] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    setSelectedDate(null)
    setRetentionData([])
    setQualityData({})
    if (user) {
      fetches?.getUserRetention(selectedTeacher).then(data => {
        setRetentionData(data?.retention||[])
      })
      fetches?.getUserQualityExt(selectedTeacher).then(data => {
        setQualityData(data||{grades:[],reviews:{}})
      })
      // Загружаем список преподавателей, если пользователь администратор (группа g1)
      if (user.group.split(';').map(group => group).includes('g1')) {
        fetches?.getTeachersList().then(data => {
          setTeachersList([...new Set(data.teachers || [])])
        })
      }
      setIsLoading(false)
    }
  }, [user,selectedTeacher])

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
        <h2>{user.name}</h2>
        <div className="user-info">
          <h4>Общая информация</h4>
          <p>Email: {user.email}</p>
          <p>Группа: {user.group.split(';').map(group => groupDict[group]).join(', ')}</p>
          <p>Должность: {user.position}</p>
          <p>Отдел: {user.department}</p>
        </div>
        
        {/* Выпадающий список выбора преподавателя для администраторов */}
        {user.group.split(';').map(group => group).includes('g1') && (
          <TeacherSelector 
            teachersList={teachersList} 
            onTeacherChange={setSelectedTeacher} 
          />
        )}
        
        <Retention data={retentionData} isMobile={isMobile} refresh={isLoading}/>
        <SimpleQC data={qualityData?.error ? {error:qualityData?.error} : qualityData?.grades} onDateSelect={handleDateSelect} isMobile={isMobile} refresh={isLoading}/>
        
        <div className="feedback-section">
          <h2>Обратная связь</h2>
          <FeedbackList 
            feedback={qualityData?.error ? {error:qualityData?.error} : qualityData?.reviews} 
            selectedDate={selectedDate} 
            isMobile={isMobile} 
            refresh={isLoading}
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