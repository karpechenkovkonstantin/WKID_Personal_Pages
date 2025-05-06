import { useState } from 'react'

// Стили для выпадающего списка
const dropdownStyles = {
  teacherSelector: {
    margin: '20px 0',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '100%'
  },
  teacherDropdown: {
    marginLeft: '10px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-color)',
    fontSize: '16px',
    cursor: 'pointer',
    minWidth: '200px',
    maxWidth: '100%'
  },
  label: {
    fontWeight: '500',
    fontSize: '16px'
  },
  loading: {
    marginLeft: '10px',
    fontSize: '16px',
    color: 'var(--text-secondary)'
  }
}

function TeacherSelector({ teachersList, onTeacherChange }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  
  // Проверяем, загружен ли список
  const isLoading = !teachersList || teachersList.length === 0

  // Обработчик выбора преподавателя
  const handleTeacherChange = (e) => {
    const teacherId = e.target.value
    setSelectedTeacher(teacherId === "" ? null : teacherId)
    onTeacherChange(teacherId === "" ? null : teacherId)
  }

  return (
    <div style={dropdownStyles.teacherSelector}>
      <label htmlFor="teacher-select" style={dropdownStyles.label}>
        Выберите преподавателя: 
      </label>
      {isLoading ? (
        <span style={dropdownStyles.loading}>Загрузка...</span>
      ) : (
        <select 
          id="teacher-select"
          value={selectedTeacher || ""}
          onChange={handleTeacherChange}
          style={dropdownStyles.teacherDropdown}
        >
          <option value="">Мои данные</option>
          {teachersList.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default TeacherSelector 